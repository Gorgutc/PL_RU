import type { Metadata, Viewport } from 'next';
import { Inter, Roboto, Roboto_Mono } from 'next/font/google';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/blueprint-overrides.scss';
import './globals.scss';

// The workspace UI font ($font-sans) is bundled, not taken from the OS: the
// designer artboards are set in Inter, but no machine in the pipeline had it
// installed — local Windows fell back to Segoe UI and the Linux CI runner to
// DejaVu Sans, whose wider glyphs overflowed the frozen toolbar fitting gate
// and inflated every cross-OS visual diff. Self-hosting via next/font gives
// local, CI, and the Figma exports the same glyph metrics.
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

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
  icons: {
    icon: [{ url: '/left-rail-icons/globe-outline.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d10', // mirror of $color-bg in src/styles/_tokens.scss
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`bp6-dark ${inter.variable} ${roboto.variable} ${robotoMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
