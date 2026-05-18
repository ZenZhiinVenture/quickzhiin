import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Intro() {
  const t = useTranslations('RootLayout');
  return (
    <div className="flex justify-center w-full max-w-4xl px-4 py-8 mx-auto gap-x-8">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl p-4 rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center w-full max-w-2xl p-4 mt-8">
          <h1 className="mt-4 text-lg text-center">{t('title')}</h1>
          <p className="mt-4 text-lg text-center">{t('description')}</p>
          <p className="mt-4 text-lg text-center">{t('description2')}</p>
        </div>
      </div>

      <Image
        src="/cloudaccounting.png"
        alt="Cloud Accounting"
        width={500}
        height={500}
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}
