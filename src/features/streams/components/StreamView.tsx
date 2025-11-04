'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, Share2, MessageCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Stream } from '../types';

interface StreamViewProps {
  stream: Stream;
}

export function StreamView({ stream }: StreamViewProps) {
  const router = useRouter();
  const [showChat, setShowChat] = useState(true);
  const [domain, setDomain] = useState('localhost');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: stream.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <main className="page-start" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="btn-ghost"
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={20} />
          Back to Streams
        </button>

        {/* Main Grid - Desktop: side-by-side, Mobile: stacked */}
        <div className="stream-layout">
          {/* Video Section */}
          <div className="stream-video-section">
            {/* Player */}
            <div
              className="glass-panel"
              style={{
                padding: 0,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%',
                  background: 'var(--bg)',
                }}
              >
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  src={`https://www.youtube.com/embed/${stream.youtubeId}?autoplay=1&modestbranding=1&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={stream.title}
                />
              </div>

              {/* Live Badge Overlay */}
              {stream.isLive && (
                <div
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
                    zIndex: 10,
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
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--fg)' }}>
                    {stream.title}
                  </h1>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                      <Calendar size={18} className="text-muted" />
                      <span className="text-muted">{new Date(stream.scheduledAt).toLocaleString()}</span>
                    </div>

                    {stream.viewerCount && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                        <Users size={18} className="text-muted" />
                        <span className="text-muted">{stream.viewerCount} watching</span>
                      </div>
                    )}
                  </div>

                  <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                    {stream.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                  <button onClick={handleShare} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Share2 size={18} />
                    <span className="share-text">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section - Desktop: sidebar, Mobile: below video */}
          {stream.isLive && (
            <div className="stream-chat-section">
              <div className="glass-panel chat-panel" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageCircle size={20} />
                    Live Chat
                  </h3>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="btn-ghost chat-toggle-btn"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    {showChat ? <X size={18} /> : <MessageCircle size={18} />}
                  </button>
                </div>

                {/* YouTube Chat Embed */}
                {showChat && (
                  <div className="chat-iframe-wrapper">
                    <iframe
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      src={`https://www.youtube.com/live_chat?v=${stream.youtubeId}&embed_domain=${domain}`}
                      title="YouTube Live Chat"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat недоступен для неживых стримов */}
          {!stream.isLive && (
            <div className="stream-chat-section">
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <MessageCircle size={48} color="var(--muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--fg)' }}>
                  Chat Unavailable
                </h3>
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                  Live chat is only available during active streams
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Desktop Layout */
        .stream-layout {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr 380px;
        }

        .stream-video-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stream-chat-section {
          position: sticky;
          top: 2rem;
          height: fit-content;
          max-height: calc(100vh - 4rem);
        }

        .chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 600px;
        }

        .chat-iframe-wrapper {
          flex: 1;
          background: var(--bg);
          min-height: 500px;
        }

        .chat-toggle-btn {
          display: none;
        }

        /* Tablet Layout */
        @media (max-width: 1024px) {
          .stream-layout {
            grid-template-columns: 1fr;
          }

          .stream-chat-section {
            position: relative;
            top: 0;
            max-height: 500px;
          }

          .chat-panel {
            min-height: 500px;
          }
        }

        /* Mobile Layout */
        @media (max-width: 640px) {
          .share-text {
            display: none;
          }

          .stream-chat-section {
            max-height: 450px;
          }

          .chat-panel {
            min-height: 400px;
          }

          .chat-iframe-wrapper {
            min-height: 350px;
          }

          .chat-toggle-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        /* Extra Small Mobile */
        @media (max-width: 480px) {
          .stream-chat-section {
            max-height: 380px;
          }

          .chat-panel {
            min-height: 350px;
          }

          .chat-iframe-wrapper {
            min-height: 300px;
          }
        }
      `}</style>
    </main>
  );
}