import { Search, Video } from "lucide-react";
import type { TabType } from "../types";

interface HeaderProps {
  tab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function Header({ tab, onTabChange }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <div className="flex items-center gap-3">
            {/* Logo icon - cute pig face */}
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-200 animate-float">
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="24" cy="26" rx="18" ry="16" fill="white" />
                <ellipse cx="12" cy="13" rx="7" ry="5" fill="white" />
                <ellipse cx="36" cy="13" rx="7" ry="5" fill="white" />
                <circle cx="18" cy="25" r="3" fill="#292524" />
                <circle cx="30" cy="25" r="3" fill="#292524" />
                <circle cx="19" cy="24" r="1.2" fill="white" />
                <circle cx="31" cy="24" r="1.2" fill="white" />
                <ellipse cx="24" cy="31" rx="5" ry="3.5" fill="#ea580c" />
                <circle cx="22" cy="31" r="1.2" fill="#7c2d12" />
                <circle cx="26" cy="31" r="1.2" fill="#7c2d12" />
                <path d="M19 35.5 Q24 39.5 29 35.5" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-amber-800 leading-tight tracking-tight">
                猪皮小香油
              </h1>
              <p className="text-[11px] text-amber-500 leading-tight font-medium tracking-wide">
                海外游戏网红资源库
              </p>
            </div>
          </div>
          <nav className="flex gap-1 bg-amber-100/60 p-1 rounded-xl">
            <button
              onClick={() => onTabChange("influencer")}
              className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 " + (tab === "influencer" ? "bg-white text-primary-600 shadow-sm shadow-amber-200/50" : "text-amber-700 hover:text-amber-900 hover:bg-amber-100/40")}
            >
              <Search className="w-4 h-4" />
              找博主
            </button>
            <button
              onClick={() => onTabChange("videos")}
              className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 " + (tab === "videos" ? "bg-white text-primary-600 shadow-sm shadow-amber-200/50" : "text-amber-700 hover:text-amber-900 hover:bg-amber-100/40")}
            >
              <Video className="w-4 h-4" />
              案例视频
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
