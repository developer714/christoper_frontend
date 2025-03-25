// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import './globals.css';

export const metadata = {
  title: 'HCleanz - Cleaning Services',
  description: 'Book professional cleaning services on demand',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}