
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define the resources for our languages
const resources = {
  en: {
    translation: {
      "newChat": "New Chat",
      "chatGPT": "ChatGPT",
      "whatCanIHelpWith": "What can I help with?",
      "search": "Search",
      "reason": "Reason",
      "upgradePlan": "Upgrade plan",
      "moreAccess": "More access to the best models",
      "canMakeMistakes": "ChatGPT can make mistakes. Check important info.",
      "explorGPTs": "Explore GPTs",
      "sendMessage": "Send message",
      "january": "January",
      "settings": "Settings",
      "theme": {
        "title": "Theme",
        "light": "Light",
        "dark": "Dark",
        "system": "System"
      },
      "language": {
        "title": "Language",
        "english": "English",
        "arabic": "Arabic"
      },
      "cancel": "Cancel",
      "save": "Save"
    }
  },
  ar: {
    translation: {
      "newChat": "محادثة جديدة",
      "chatGPT": "ChatGPT",
      "whatCanIHelpWith": "كيف يمكنني مساعدتك؟",
      "search": "بحث",
      "reason": "سبب",
      "upgradePlan": "ترقية الخطة",
      "moreAccess": "وصول أكبر إلى أفضل النماذج",
      "canMakeMistakes": "ChatGPT قد يرتكب أخطاء. تحقق من المعلومات المهمة.",
      "explorGPTs": "استكشف GPTs",
      "sendMessage": "إرسال الرسالة",
      "january": "يناير",
      "settings": "الإعدادات",
      "theme": {
        "title": "السمة",
        "light": "فاتح",
        "dark": "داكن",
        "system": "نظام"
      },
      "language": {
        "title": "اللغة",
        "english": "الإنجليزية",
        "arabic": "العربية"
      },
      "cancel": "إلغاء",
      "save": "حفظ"
    }
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    returnNull: false
  });

export default i18n;
