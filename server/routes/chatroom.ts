const clients = new Map<string, { peer: any; room: string | null }>();
const channels = new Map<string, { clients: Set<string>; gamemode: string | null }>();

export default defineWebSocketHandler({
    open(peer) {
        peer.send({ user: "server", message: `Welcome ${peer}!` });
        clients.set(peer.id, { peer, room: null });
        peer.publish("chat", { user: "server", message: `${peer} joined!` });
        peer.subscribe("chat");
    },
    async message(peer, message) {
        try {
            const { action, room_id, content, sender } = JSON.parse(message.toString());
            const clientId = peer.id;
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
                    const client = clients.get(clientId);
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
                const client = clients.get(clientId);
                if (client) {
                    client.room = null;
                }
                peer.send(JSON.stringify({ status: 'left', room_id: currentRoom }));
            } else if (action === 'message') {
                // Broadcast to a room
                const currentRoom = clients.get(clientId)?.room;
                if (currentRoom && channels.has(currentRoom)) {
                    const db = useDatabase();
                    if (db) {
                        try {
                            const msgId = `${Date.now()}-${clientId}`;
                            // insert new message into db
                            if (!history[currentRoom]) {
                                history[currentRoom] = [];
                            }
                            history[currentRoom].push({ id: msgId, sender, content });
                            await db.sql`INSERT INTO messages (room, message) VALUES (${currentRoom}, ${content}) ON CONFLICT (room) DO UPDATE SET chatHistory = ${JSON.stringify(history)}`;
                        } catch (err) {
                            console.error('Error sending message:', err);
                        }
                    }
                    channels.get(currentRoom)?.clients.forEach((otherClientId: string) => {
                        if (otherClientId !== clientId) {
                            const recipient = clients.get(otherClientId);
                            if (recipient) {
                                recipient.peer.send(JSON.stringify({ room_id: currentRoom, content, sender }));
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