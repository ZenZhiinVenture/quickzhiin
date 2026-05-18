'use client';

import LoginComponent from '@/components/auth/login';

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl h-10">
        Welcome to {process.env.NEXT_PUBLIC_APP_NAME}.
      </h1>
      <div className="w-full max-w-md p-4 mt-6 rounded-lg shadow-md ">
        <LoginComponent />
      </div>
    </div>
  );
}
