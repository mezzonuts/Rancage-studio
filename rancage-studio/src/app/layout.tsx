import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rancagé Studio',
  description: 'Local-first AI spreadsheet & dashboard engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="bg-background text-foreground flex min-h-full flex-col">{children}</body>
    </html>
  );
}
