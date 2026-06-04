import { ExternalLink, Eye, Calendar, User } from "lucide-react";
import { formatViewCount, formatDate, truncate } from "../utils";
import type { VideoDisplay } from "../types";

interface VideoCardProps {
  video: VideoDisplay;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden card-hover hover:shadow-md hover:border-slate-200 group">
      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-slate-100 overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <ExternalLink className="w-5 h-5 text-slate-700 ml-0.5" />
          </div>
        </div>
      </a>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-800 leading-snug line-clamp-2 text-sm">
          {truncate(video.title, 60)}
        </h3>
        <div className="flex items-center gap-2">
          {video.channelAvatar ? (
            <img
              src={video.channelAvatar}
              alt=""
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
          <span className="text-xs text-slate-500 truncate">{video.channelTitle}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatViewCount(video.viewCount)} 次观看
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(video.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
