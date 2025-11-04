export interface Stream {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnail: string;
  scheduledAt: string;
  isLive: boolean;
  viewerCount?: number;
}