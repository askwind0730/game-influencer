export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeSearchItem {
  kind: string;
  id: {
    kind: string;
    channelId?: string;
    videoId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    channelTitle: string;
    liveBroadcastContent?: string;
    publishTime?: string;
  };
}

export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    country?: string;
  };
  statistics: {
    viewCount?: string;
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
    videoCount?: string;
  };
}

export interface YouTubeChannelResult {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeChannel[];
}

export interface YouTubeVideoContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  projection: string;
}

export interface YouTubeVideoItem {
  kind: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
    channelTitle: string;
    tags?: string[];
    categoryId?: string;
    liveBroadcastContent?: string;
  };
  contentDetails?: YouTubeVideoContentDetails;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    favoriteCount?: string;
    commentCount?: string;
  };
}

export interface YouTubeVideoListResult {
  kind: string;
  etag: string;
  items: YouTubeVideoItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface ChannelDisplay {
  id: string;
  title: string;
  avatar: string;
  subscriberCount: string;
  videoCount: string;
  country?: string;
  channelUrl: string;
}

export interface VideoDisplay {
  videoId: string;
  title: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  channelAvatar?: string;
  viewCount: string;
  publishedAt: string;
  videoUrl: string;
  durationSec: number;
  isShort: boolean;
  isSponsored: boolean;
  videoCount: number;
}

export interface GameCreatorData {
  channelId: string;
  channelTitle: string;
  channelAvatar: string;
  channelUrl: string;
  subscriberCount: string;
  country?: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail: string;
  videoViewCount: string;
  videoPublishedAt: string;
  videoUrl: string;
  durationSec: number;
  isShort: boolean;
  isSponsored: boolean;

  videoCount: number;
}

export type TabType = "influencer" | "videos";
