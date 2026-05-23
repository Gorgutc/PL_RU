import { ExampleCard } from '@/components/ExampleCard/ExampleCard';

export default function Page() {
  return (
    <main>
      <h1>TS Frontend Starter</h1>
      <p>Next.js 16 + React 19 + Blueprint + SCSS modules. Replace this page with your app.</p>
      <ExampleCard
        title="Hello from Blueprint"
        body="This card uses a Blueprint Card + Button, wrapped in a SCSS module. Edit src/components/ExampleCard/ to see how the pattern works."
        ctaLabel="Get started"
      />
    </main>
  );
}
