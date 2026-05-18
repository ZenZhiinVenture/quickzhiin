import React from 'react';
import { useTranslations } from 'next-intl';

interface ContactProps {
  className?: string;
}

function Contact({ className }: ContactProps) {
  const t = useTranslations('footer');

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">{t('contact')}</h3>
      <ul className="space-y-2">
        <li className="text-sm text-gray-600">
          <a
            href="mailto:support@quickzhiin.com"
            className="hover:text-blue-600"
          >
            support@quickzhiin.com
          </a>
        </li>
        <li className="text-sm text-gray-600">
          <a href="tel:+60135930697" className="hover:text-blue-600">
            +60135930697
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Contact;
