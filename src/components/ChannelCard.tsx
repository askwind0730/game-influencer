import { ExternalLink, Users, User } from "lucide-react";
import { formatSubCount, getRegionLabel, getRegionColor, truncate } from "../utils";
import type { ChannelDisplay } from "../types";

interface ChannelCardProps {
  channel: ChannelDisplay;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const regionLabel = getRegionLabel(channel.country);
  const regionColor = regionLabel ? getRegionColor(regionLabel) : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden card-hover hover:shadow-md hover:border-slate-200 group">
      <div className="p-6 flex flex-col items-center text-center gap-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-slate-100 group-hover:ring-primary-200 transition-all">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.title}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <User className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-slate-800 leading-tight line-clamp-2 min-h-[2.5rem]">
          {truncate(channel.title, 30)}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>{formatSubCount(channel.subscriberCount)} 订阅</span>
        </div>
        {regionLabel && (
          <span className={"inline-block px-2.5 py-0.5 rounded-full text-xs font-medium " + regionColor}>
            {regionLabel}
          </span>
        )}
        <a
          href={channel.channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 hover:text-primary-700 rounded-lg text-sm font-medium transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          打开频道
        </a>
      </div>
    </div>
  );
}
