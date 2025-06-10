import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Suspense } from 'react'; // Import Suspense

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SHARE CRM | Exercise Classes for 50+',
  description: 'SHARE CRM system for managing classes, instructors, and bookings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Suspense fallback={<div>Loading application...</div>}> {/* Wrap children with Suspense */}
            {children}
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
