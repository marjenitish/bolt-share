'use client';

import { useState } from 'react';
import LoginForm from './login-form';
import Link from 'next/link';
import ForgotPasswordForm from './forgot-password-form';
import { Logo } from '@/components/ui/logo';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'forgot-password'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center">
          <Link href="/">
            <Logo className="h-12 w-auto" />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-center text-foreground">
            {view === 'login' ? 'Sign In' : 'Reset Password'}
          </h2>
        </div>
        
        {view === 'login' ? (
          <LoginForm onForgotPassword={() => setView('forgot-password')} />
        ) : (
          <ForgotPasswordForm onBack={() => setView('login')} />
        )}
      </div>
    </div>
  );
}