import type { Metadata, Viewport } from 'next';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '../styles/blueprint-overrides.scss';
import './globals.scss';

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
    <html lang="en" className="bp6-dark">
      <body>{children}</body>
    </html>
  );
}
