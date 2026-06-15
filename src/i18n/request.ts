import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  // For static export, we don't use dynamic locale resolution.
  // The locale is passed explicitly via NextIntlClientProvider in the layout.
  // This config stub satisfies next-intl's requirement for a config file.
  return {
    locale: routing.defaultLocale,
    messages: (await import(`../../messages/${routing.defaultLocale}.json`))
      .default,
  };
});
