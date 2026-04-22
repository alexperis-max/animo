import type { Metadata } from 'next';
import { Noto_Serif, Manrope } from 'next/font/google';
import './globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['200', '300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Ánimo - Tu santuario de medianoche',
  description: 'Un diario de estado de ánimo diario',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${notoSerif.variable} ${manrope.variable} dark`}>
      <body className="bg-[#0a0a0a] text-gray-100 font-sans antialiased selection:bg-purple-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
