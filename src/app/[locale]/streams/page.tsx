import { getTranslations } from 'next-intl/server';
import { StreamsGrid } from '@/features/streams/components/StreamsGrid';
import { getActiveStreams } from '@/features/streams/utils/streamHelpers';

export default async function StreamsPage() {
  const t = await getTranslations('streams');
  const streams = await getActiveStreams();

  return (
    <main className="page-start" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">
        {/* Hero Section */}
        <section style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1rem' }}>
            {t('title')}
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            {t('subtitle')}
          </p>
        </section>

        {/* Streams Grid */}
        <StreamsGrid streams={streams} />
      </div>
    </main>
  );
}