import type { Stream } from '../types';

const MOCK_STREAMS: Stream[] = [
  {
    id: 'dQw4w9WgXcQ', // Используем YouTube ID как ID стрима
    youtubeId: 'dQw4w9WgXcQ',
    title: 'English Grammar Masterclass - Live Session',
    description: 'Join us for an interactive grammar session covering present perfect tense and common mistakes. We will practice real-life examples and answer all your questions in real-time!',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    scheduledAt: new Date().toISOString(),
    isLive: true,
    viewerCount: 42,
  },
  {
    id: 'jNQXAC9IVRw',
    youtubeId: 'jNQXAC9IVRw',
    title: 'IELTS Speaking Practice - Band 7+ Tips',
    description: 'Learn advanced speaking techniques with our expert mentor. Master fluency, vocabulary, and pronunciation strategies.',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    isLive: false,
    viewerCount: 0,
  },
  {
    id: '9bZkp7q19f0',
    youtubeId: '9bZkp7q19f0',
    title: 'Business English Conversation Workshop',
    description: 'Professional communication skills for the workplace. Negotiations, presentations, and email writing.',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    scheduledAt: new Date(Date.now() - 3600000).toISOString(),
    isLive: false,
    viewerCount: 127,
  },
];

export async function getActiveStreams(): Promise<Stream[]> {
  return MOCK_STREAMS;
}

export async function getStreamById(id: string): Promise<Stream | null> {
  return MOCK_STREAMS.find((s) => s.id === id) || null;
}