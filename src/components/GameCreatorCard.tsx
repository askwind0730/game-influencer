import { ExternalLink, Eye, Calendar, Users, User, Sparkles } from "lucide-react";
import { formatSubCount, formatViewCount, formatDate, getRegionLabel, getRegionColor, truncate } from "../utils";
import type { GameCreatorData } from "../types";

interface Props {
  creator: GameCreatorData;
  isSelected?: boolean;
  onToggle?: (id: string) => void;
}

export default function GameCreatorCard({ creator, isSelected, onToggle }: Props) {
  const regionLabel = getRegionLabel(creator.country);
  const regionColor = regionLabel ? getRegionColor(regionLabel) : "";

  const cardClass = "relative bg-white rounded-xl shadow-sm border overflow-hidden card-hover group cursor-pointer transition-all "
    + (isSelected ? "ring-2 ring-primary-500 bg-primary-50/30 shadow-md border-primary-200" : "border-slate-100 hover:shadow-md hover:border-slate-200");

  return (
    <div className={cardClass} onClick={() => onToggle?.(creator.channelId)}>
      {/* Select checkbox */}
      {isSelected ? (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center bg-primary-600 text-white text-xs font-bold shadow-sm">
          ✓
        </div>
      ) : (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 border-slate-300 shadow-sm">
        </div>
      )}

      {/* Channel Header */}
      <div className="p-4 pb-2 flex items-center gap-3 border-b border-slate-50">
        <a href={creator.channelUrl} target="_blank" rel="noopener noreferrer">
          {creator.channelAvatar ? (
            <img
              src={creator.channelAvatar}
              alt={creator.channelTitle}
              className="w-10 h-10 rounded-full ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center ring-2 ring-slate-100">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          )}
        </a>
        <div className="flex-1 min-w-0">
          <a href={creator.channelUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 text-sm hover:text-primary-600 transition-colors line-clamp-1">
            {truncate(creator.channelTitle, 28)}
          </a>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatSubCount(creator.subscriberCount)}
            </span>
            {regionLabel && (
              <span className={"px-1.5 py-0.5 rounded text-[10px] font-medium " + regionColor}>
                {regionLabel}
              </span>
            )}
            {creator.isShort && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700">Shorts</span>
            )}
            {creator.isSponsored && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Sponsor
              </span>
            )}
            {creator.videoCount > 1 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                {'\u5408\u4F5C'} {creator.videoCount} {'\u6B21'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Section */}
      <a href={creator.videoUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-slate-100 overflow-hidden">
        <img
          src={creator.videoThumbnail}
          alt={creator.videoTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <ExternalLink className="w-4 h-4 text-slate-700 ml-0.5" />
          </div>
        </div>
      </a>

      <div className="p-3 space-y-2">
        <h4 className="font-medium text-slate-800 text-xs leading-snug line-clamp-2">
          {truncate(creator.videoTitle, 55)}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViewCount(creator.videoViewCount)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(creator.videoPublishedAt)}
          </span>
        </div>
        <div className="flex gap-2 pt-1">
          <a href={creator.channelUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 hover:text-primary-700 rounded-lg text-xs font-medium transition-all">
            {"\u6253\u5F00\u9891\u9053"}
          </a>
          <a href={creator.videoUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-700 rounded-lg text-xs font-medium transition-all">
            {"\u89C2\u770B\u89C6\u9891"}
          </a>
        </div>
      </div>
    </div>
  );
}
