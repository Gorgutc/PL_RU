import type { Metadata, Viewport } from 'next';
import { Roboto, Roboto_Mono } from 'next/font/google';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '../styles/blueprint-overrides.scss';
import './globals.scss';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-roboto',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TS Frontend Starter',
  description: 'Next.js 16 + React 19 + Blueprint + SCSS modules starter.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d10', // mirror of $color-bg in src/styles/_tokens.scss
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`bp6-dark ${roboto.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
