import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({locale}) => {
  // Validate that the locale is supported
  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  try {
    return {
      messages: (await import(`../../messages/${locale}.json`)).default
    };
  } catch (error) {
    console.error(`Could not load messages for locale ${locale}:`, error);
    return {
      messages: (await import(`../../messages/${routing.defaultLocale}.json`)).default
    };
  }
});
