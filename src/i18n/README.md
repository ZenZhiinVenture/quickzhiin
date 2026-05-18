# Internationalization (i18n) Guide

This project uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization. Here's how to use it:

## Structure

- `src/config/i18n.ts`: Contains the locale configuration
- `src/messages/`: Contains the translation files for each language
- `middleware.ts`: Handles locale detection and routing
- `src/components/LanguageSwitcher.tsx`: Component for switching between languages

## Supported Languages

- English (en)
- Malay (ms)
- Chinese (zh)
- Spanish (es)
- French (fr)

## How to Use Translations

### In Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyServerComponent() {
  const t = useTranslations('namespace');

  return (
    <div>
      <h1>{t('key')}</h1>
    </div>
  );
}
```

### In Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
  const t = useTranslations('namespace');

  return (
    <div>
      <h1>{t('key')}</h1>
    </div>
  );
}
```

### Using the TranslatedText Component

For simple text translations, you can use the `TranslatedText` component:

```tsx
import TranslatedText from '@/components/TranslatedText';

export default function MyComponent() {
  return (
    <div>
      <TranslatedText namespace="common" key="welcome" />
    </div>
  );
}
```

## Adding New Translations

1. Add new translation keys to the JSON files in `src/messages/`
2. Create new language files following the same structure as `en.json` and `ms.json`

## URL Structure

The application uses URL-based locale switching. For example:

- `/en/dashboard` - English dashboard
- `/ms/dashboard` - Malay dashboard

## Language Switcher

The `LanguageSwitcher` component is available to switch between languages. It's already included in the layout.

## Example

See `src/app/[locale]/translation-example/page.tsx` for a complete example of how to use translations in your components.
