import { v4 as uuidv4 } from "uuid";

const clients = new Map<string, { peer: any; room: string | null; rateLimiter: RateLimiter }>();
const channels = new Map<string, { clients: Set<string>; gamemode: string | null }>();

class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private readonly refillRate: number;
    private readonly capacity: number;

    constructor(refillRate: number, capacity: number) {
        this.tokens = capacity;
        this.lastRefill = Date.now();
        this.refillRate = refillRate;
        this.capacity = capacity;
    }

    private refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const tokensToAdd = (elapsed / 1000) * this.refillRate;
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    public tryRemoveTokens(count: number): boolean {
        this.refill();
        if (this.tokens >= count) {
            this.tokens -= count;
            return true;
        }
        return false;
    }
}

export default defineWebSocketHandler({
    open(peer) {
        peer.send({ user: "server", message: `Welcome ${peer}!` });
        clients.set(peer.id, { peer, room: null, rateLimiter: new RateLimiter(0.5, 4) }); // 0.5 tokens per second, capacity at 4 tokens
        peer.publish("chat", { user: "server", message: `${peer} joined!` });
        peer.subscribe("chat");
    },
    async message(peer, message) {
        try {
            const { action, room_id, id: msgId, content, sender, createdAt } = JSON.parse(message.toString());
            const clientId = peer.id;
            const client = clients.get(clientId);

            if (!client) {
                peer.send(JSON.stringify({ error: 'Client not found' }));
                return;
            }

            if (!client.rateLimiter.tryRemoveTokens(1)) {
                peer.send(JSON.stringify({ error: 'Rate limit exceeded' }));
                return;
            }

            if (action === 'create') {
                // server action to create a room
                if (!channels.has(room_id)) {
                    channels.set(room_id, { clients: new Set(), gamemode: content });
                    console.log(`Room created: ${room_id}`);
                    peer.send(JSON.stringify({ status: 'created', room_id }));
                } else {
                    peer.send(JSON.stringify({ error: 'Room already exists' }));
                }
            } else if (action === 'join') {
                // Join a room
                if (clients.has(clientId)) {
                    const prevRoom = clients.get(clientId)?.room;
                    if (prevRoom && channels.has(prevRoom)) {
                        channels.get(prevRoom)?.clients.delete(clientId);
                    }
                    if (client) {
                        client.room = room_id;
                    }
                    if (!channels.has(room_id)) {
                        channels.set(room_id, { clients: new Set(), gamemode: null });
                    }
                    channels.get(room_id)?.clients.add(clientId);

                    console.log(`Client ${clientId} joined room: ${room_id}`);
                    peer.send(JSON.stringify({ status: 'joined', room_id }));
                }
            } else if (action === 'leave') {
                // Leave a room
                const currentRoom = clients.get(clientId)?.room;
                if (currentRoom && channels.has(currentRoom)) {
                    channels.get(currentRoom)?.clients.delete(clientId);
                }
                if (client) {
                    client.room = null;
                }
                peer.send(JSON.stringify({ status: 'left', room_id: currentRoom }));
            } else if (action === 'message') {
                // Broadcast to a room
                const currentRoom = clients.get(clientId)?.room;
                if (currentRoom && channels.has(currentRoom)) {
                    const db = useDatabase("chat");
                    if (db) {
                        try {
                            await db.sql`INSERT INTO messages (id, roomId, userId, username, message) VALUES (${msgId}, ${currentRoom}, ${sender.id}, ${sender.name}, ${content})`;
                        } catch (err) {
                            console.error('Error sending message:', err);
                        }
                    }
                    channels.get(currentRoom)?.clients.forEach((otherClientId: string) => {
                        if (otherClientId !== clientId) {
                            const recipient = clients.get(otherClientId);
                            if (recipient) {
                                recipient.peer.send(JSON.stringify({ id: msgId, content, sender, createdAt }));
                            }
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Error handling message:', err);
            peer.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    },
    close(peer) {
        peer.publish("chat", { user: "server", message: `${peer} left!` });
        const room = clients.get(peer.id)?.room;
        if (room && channels.has(room)) {
            channels.get(room)?.clients.delete(peer.id);
        }
        clients.delete(peer.id);
        console.log(`Client disconnected: ${peer.id}`);
    },
});