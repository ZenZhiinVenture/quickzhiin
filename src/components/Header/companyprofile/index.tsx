'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function CompanyProfile() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex space-x-6 items-center gap-x-4">
      <div className="flex items-center rounded-md p-2">
        <Link href="/" className="text-xl font-bold text-blue-600">
          <Image
            src={isDark ? '/logo.png' : '/logo-light.png'}
            alt="ZenZhiin Venture"
            width={40}
            height={40}
            className="mr-2"
          />
        </Link>
        <p>ZenZhiin Venture</p>
      </div>
    </div>
  );
}
