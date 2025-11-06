/**
 * Instagram Post Types for Graph API Integration
 */

export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

export type InstagramPost = {
  id: string;
  caption: string;
  media_type: InstagramMediaType;
  media_url: string;
  permalink: string;
  timestamp: string;
  thumbnail_url?: string; // For videos
};

export type InstagramPostsResponse = {
  items: InstagramPost[];
  meta: {
    count: number;
    fetchedAt: string;
    cached: boolean;
    source: 'instagram-graph-api' | 'mock';
    error?: string;
  };
};

export type InstagramGraphApiResponse = {
  data: Array<{
    id: string;
    caption?: string;
    media_type: InstagramMediaType;
    media_url: string;
    permalink: string;
    timestamp: string;
    thumbnail_url?: string;
  }>;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
};
