'use client';

import { useRouter } from 'next/navigation';
import type { Stream } from '../types';
import { Play, Users, Calendar } from 'lucide-react';

interface StreamCardProps {
  stream: Stream;
  locale: string;
}

export function StreamCard({ stream, locale }: StreamCardProps) {
  const router = useRouter();

  return (
    <div
      className="glass-panel"
      style={{
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'var(--transition)',
      }}
      onClick={() => router.push(`/${locale}/streams/${stream.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Thumbnail */}
      <div
        className="stream-thumbnail"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          background: `url(${stream.thumbnail}) center/cover`,
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'grid',
            placeItems: 'center',
            transition: 'var(--transition)',
          }}
          className="stream-overlay"
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--gold)',
              display: 'grid',
              placeItems: 'center',
              transition: 'var(--transition)',
            }}
          >
            <Play size={28} fill="var(--bg)" stroke="var(--bg)" />
          </div>
        </div>

        {/* Live Badge */}
        {stream.isLive && (
          <span
            className="badge-error"
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: '700',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse 2s infinite',
              }}
            />
            LIVE
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.3', color: 'var(--fg)' }}>
          {stream.title}
        </h3>

        <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
          {stream.description}
        </p>

        {/* Meta */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Calendar size={16} className="text-muted" />
            <span className="text-muted">{new Date(stream.scheduledAt).toLocaleString()}</span>
          </div>

          {stream.viewerCount !== undefined && stream.viewerCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Users size={16} className="text-muted" />
              <span className="text-muted">{stream.viewerCount} watching</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .stream-thumbnail:hover .stream-overlay {
          background: rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  );
}