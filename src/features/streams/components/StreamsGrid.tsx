'use client';

import { motion } from 'framer-motion';
import { StreamCard } from './StreamCard';
import { useParams } from 'next/navigation';
import type { Stream } from '../types';

interface StreamsGridProps {
  streams: Stream[];
}

export function StreamsGrid({ streams }: StreamsGridProps) {
  const params = useParams();
  const locale = params.locale as string;

  if (streams.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>
          No active streams at the moment. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
      }}
    >
      {streams.map((stream, index) => (
        <motion.div
          key={stream.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StreamCard stream={stream} locale={locale} />
        </motion.div>
      ))}
    </div>
  );
}