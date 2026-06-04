import { YOUTUBE_API_KEY } from "../config";
import type { YouTubeSearchResult, YouTubeChannelResult, YouTubeVideoListResult } from "../types";

const API_BASE = "https://www.googleapis.com/youtube/v3";

class YouTubeApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "YouTubeApiError";
    this.status = status;
  }
}

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = "YouTube API error (" + res.status + ")";
    try {
      const err = await res.json();
      if (err?.error?.message) message = err.error.message;
    } catch {}
    throw new YouTubeApiError(message, res.status);
  }
  return res.json();
}

export async function searchChannels(
  query: string,
  regionCode?: string,
  pageToken?: string,
  maxResults: number = 24
): Promise<{ search: YouTubeSearchResult; channels: YouTubeChannelResult }> {
  const params = new URLSearchParams({
    part: "snippet",
    type: "channel",
    q: query,
    maxResults: String(maxResults),
    key: YOUTUBE_API_KEY,
  });
  if (regionCode) params.set("regionCode", regionCode);
  if (pageToken) params.set("pageToken", pageToken);

  const search: YouTubeSearchResult = await fetchJSON(API_BASE + "/search?" + params.toString());

  const channelIds = search.items
    .map((item) => item.id.channelId)
    .filter((id): id is string => !!id);

  let channels: YouTubeChannelResult = { kind: "", etag: "", pageInfo: { totalResults: 0, resultsPerPage: 0 }, items: [] };
  if (channelIds.length > 0) {
    const cParams = new URLSearchParams({
      part: "snippet,statistics",
      id: channelIds.join(","),
      key: YOUTUBE_API_KEY,
    });
    channels = await fetchJSON(API_BASE + "/channels?" + cParams.toString());
  }

  return { search, channels };
}

export async function searchVideos(
  query: string,
  pageToken?: string,
  maxResults: number = 24,
  order: string = "relevance"
): Promise<{ search: YouTubeSearchResult; videos: YouTubeVideoListResult }> {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: query,
    maxResults: String(maxResults),
    key: YOUTUBE_API_KEY,
    order: order,
  });
  if (pageToken) params.set("pageToken", pageToken);

  const search: YouTubeSearchResult = await fetchJSON(API_BASE + "/search?" + params.toString());

  const videoIds = search.items
    .map((item) => item.id.videoId)
    .filter((id): id is string => !!id);

  let videos: YouTubeVideoListResult = { kind: "", etag: "", items: [], pageInfo: { totalResults: 0, resultsPerPage: 0 } };
  if (videoIds.length > 0) {
    const vParams = new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds.join(","),
      key: YOUTUBE_API_KEY,
    });
    videos = await fetchJSON(API_BASE + "/videos?" + vParams.toString());
  }

  return { search, videos };
}

export async function getChannelsByIds(channelIds: string[]): Promise<YouTubeChannelResult> {
  if (channelIds.length === 0) {
    return { kind: "", etag: "", pageInfo: { totalResults: 0, resultsPerPage: 0 }, items: [] };
  }
  const params = new URLSearchParams({
    part: "snippet,statistics",
    id: channelIds.join(","),
    key: YOUTUBE_API_KEY,
  });
  return fetchJSON(API_BASE + "/channels?" + params.toString());
}

// Game-specific search: finds videos about a game, gets their creators, sorts by subscribers
export interface GameCreatorRaw {
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

export async function searchGameCreators(
  query: string,
  pageToken?: string,
  maxResults: number = 24
): Promise<{ creators: GameCreatorRaw[]; nextPageToken?: string; prevPageToken?: string }> {
  const { search, videos } = await searchVideos(query, pageToken, maxResults);

  const channelIds = [...new Set(
    videos.items.map(v => v.snippet.channelId).filter(Boolean)
  )] as string[];

  let channelResult: YouTubeChannelResult = { kind: "", etag: "", pageInfo: { totalResults: 0, resultsPerPage: 0 }, items: [] };
  if (channelIds.length > 0) {
    channelResult = await getChannelsByIds(channelIds);
  }

  // Count videos per channel + find the best one (highest views)
  const videoCountByChannel: Record<string, number> = {};
  const bestVideoByChannel: Record<string, YouTubeVideoListResult["items"][0]> = {};
  for (const v of videos.items) {
    const chId = v.snippet.channelId;
    videoCountByChannel[chId] = (videoCountByChannel[chId] || 0) + 1;
    const existing = bestVideoByChannel[chId];
    if (!existing || parseInt(v.statistics?.viewCount || "0") > parseInt(existing.statistics?.viewCount || "0")) {
      bestVideoByChannel[chId] = v;
    }
  }

  // Build channel map
  const channelMap: Record<string, YouTubeChannelResult["items"][0]> = {};
  for (const ch of channelResult.items) {
    channelMap[ch.id] = ch;
  }

  // Combine and sort by subscriber count desc
  const creators: GameCreatorRaw[] = [];
  for (const chId of channelIds) {
    const ch = channelMap[chId];
    const v = bestVideoByChannel[chId];
    if (!ch || !v) continue;

    creators.push({
      channelId: ch.id,
      channelTitle: ch.snippet.title,
      channelAvatar: ch.snippet.thumbnails.high?.url || ch.snippet.thumbnails.default?.url,
      channelUrl: "https://www.youtube.com/channel/" + ch.id,
      subscriberCount: ch.statistics.subscriberCount || "0",
      country: ch.snippet.country,
      videoId: v.id,
      videoTitle: v.snippet.title,
      videoThumbnail: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
      videoViewCount: v.statistics?.viewCount || "0",
      videoPublishedAt: v.snippet.publishedAt,
      videoUrl: "https://www.youtube.com/watch?v=" + v.id,
      durationSec: parseYouTubeDuration(v.contentDetails?.duration || ""),
      isShort: isYouTubeShort(v.contentDetails?.duration || "", v.snippet.title),
      isSponsored: checkSponsored(v.snippet.title),
      videoCount: videoCountByChannel[chId] || 1,
    });
  }

  // Sort by video view count descending (highest views first)
  creators.sort((a, b) => {
    return parseInt(b.videoViewCount) - parseInt(a.videoViewCount);
  });

  return {
    creators,
    nextPageToken: search.nextPageToken,
    prevPageToken: search.prevPageToken,
  };
}

function parseYouTubeDuration(iso: string): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1]||"0")*3600) + (parseInt(m[2]||"0")*60) + parseInt(m[3]||"0");
}

function isYouTubeShort(duration: string, title: string): boolean {
  const sec = parseYouTubeDuration(duration);
  if (sec > 0 && sec < 60) return true;
  if (/shorts/i.test(title)) return true;
  return false;
}

function checkSponsored(title: string): boolean {
  const kw = [/sponsor/i, /\bad\b/i, /promot/i, /partner/i, /\bbrand/i, /collab/i, /paid/i,
              /\u8D5E\u52A9/, /\u5408\u4F5C/, /\u63A8\u5E7F/, /\u5E7F\u544A/, /\u642D\u5EFA/, /\u4E13\u9898/];
  return kw.some(r => r.test(title));
}

export { YouTubeApiError, parseYouTubeDuration, isYouTubeShort, checkSponsored };
