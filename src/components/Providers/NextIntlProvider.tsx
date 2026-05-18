'use client';

import { NextIntlClientProvider, useMessages } from 'next-intl';
import { ReactNode } from 'react';

interface NextIntlProviderProps {
  locale: string;
  children: ReactNode;
}

export default function NextIntlProvider({
  locale,
  children,
}: NextIntlProviderProps) {
  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
