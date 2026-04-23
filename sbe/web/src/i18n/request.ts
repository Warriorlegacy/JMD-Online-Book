import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  const supportedLocales = routing.locales;
  const targetLocale = supportedLocales.includes(locale as any) ? locale : routing.defaultLocale;

  try {
    let messages;
    // Explicit switch for better static analysis in production builds
    switch (targetLocale) {
      case 'es': messages = (await import('../../messages/es.json')).default; break;
      case 'fr': messages = (await import('../../messages/fr.json')).default; break;
      case 'de': messages = (await import('../../messages/de.json')).default; break;
      case 'pt': messages = (await import('../../messages/pt.json')).default; break;
      case 'ru': messages = (await import('../../messages/ru.json')).default; break;
      case 'zh': messages = (await import('../../messages/zh.json')).default; break;
      default: messages = (await import('../../messages/en.json')).default; break;
    }

    return {
      locale: targetLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${targetLocale}`, error);
    return {
      locale: targetLocale,
      messages: (await import('../../messages/en.json')).default
    };
  }
});
