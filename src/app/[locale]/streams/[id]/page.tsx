import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getStreamById } from '@/features/streams/utils/streamHelpers';
import { StreamView } from '@/features/streams/components/StreamView';

interface StreamPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function StreamPage({ params }: StreamPageProps) {
  const { id } = await params;
  const stream = await getStreamById(id);

  if (!stream) {
    notFound();
  }

  return <StreamView stream={stream} />;
}