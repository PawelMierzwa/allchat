import en from "@/i18n/en"
import pl from "@/i18n/pl"

export default defineI18nConfig(() => ({
    legacy: false,
    availableLocales: ['en', 'pl'],
    fallbackLocale: 'en',
    messages: {
        en,
        pl
    }
})) 