import { useState, useCallback } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ChannelCard from "./components/ChannelCard";
import GameCreatorCard from "./components/GameCreatorCard";
import Pagination from "./components/Pagination";
import { searchChannels, searchGameCreators } from "./api/youtube";
import { matchesRegion, isOfficialChannel } from "./utils";
import type { TabType, ChannelDisplay, GameCreatorData } from "./types";

const SKELETON_COUNT = 8;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 flex flex-col items-center gap-3">
        <div className="skeleton w-20 h-20 rounded-full" />
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonCreatorCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b border-slate-50">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-4 w-28" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
      <div className="skeleton w-full aspect-video" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-3 w-24" />
        <div className="flex gap-2">
          <div className="skeleton h-7 flex-1 rounded-lg" />
          <div className="skeleton h-7 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const L = {
  searchPlace: "\u641C\u7D22\u5173\u952E\u8BCD\uFF0C\u5982 gaming, Minecraft, PUBG...",
  gamePlace: "\u6E38\u620F\u4EA7\u54C1\u540D\u79F0\uFF0C\u5982 Genshin Impact, Honor of Kings...",
  chResult: "\u5171\u663E\u793A {n} \u4E2A\u7ED3\u679C",
  crResult: "\u5171\u663E\u793A {n} \u4E2A\u521B\u4F5C\u8005\u5408\u4F5C\u89C6\u9891",
  prev: "\u2190 \u4E0A\u4E00\u9875",
  next: "\u4E0B\u4E00\u9875 \u2192",
  footer: "猪皮小香油 — 海外游戏网红资源库",
  noResults: "\u6682\u65E0\u7ED3\u679C\uFF0C\u8BF7\u5C1D\u8BD5\u66F4\u6362\u5173\u952E\u8BCD\u6216\u653E\u5BBD\u7B5B\u9009\u6761\u4EF6",
};

export default function App() {
  const [tab, setTab] = useState<TabType>("influencer");
  const [region, setRegion] = useState("");

  // Tab 1 state: channel search
  const [channels, setChannels] = useState<ChannelDisplay[]>([]);
  const [chLoading, setChLoading] = useState(false);
  const [chError, setChError] = useState<string | null>(null);

  const [chQuery, setChQuery] = useState("");

  // Tab 2 state: game creator search
  const [creators, setCreators] = useState<GameCreatorData[]>([]);
  const [crLoading, setCrLoading] = useState(false);
  const [crError, setCrError] = useState<string | null>(null);

  const [crQuery, setCrQuery] = useState("");
  const [crHasSearched, setCrHasSearched] = useState(false);

  // Filter state
  const [subRange, setSubRange] = useState("all");
  const [viewRange, setViewRange] = useState("all");
  const [videoType, setVideoType] = useState("all");
  const [sponsorFilter, setSponsorFilter] = useState("all");

  // Pagination state (shared across tabs)
  const [pgTokens, setPgTokens] = useState<(string | undefined)[]>([undefined]);
  const [pgIdx, setPgIdx] = useState(0);
  const [pgHasNext, setPgHasNext] = useState(false);

  // Selection + export
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleSelect = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exportSelected = () => {
    const items = creators.filter(cr => selected[cr.channelId]);
    if (items.length === 0) return;
    // BOM + CSV header
    const csv = "\uFEFF\u535A\u4E3B\u540D\u79F0,\u56FD\u5BB6/\u5730\u533A,\u535A\u4E3B\u94FE\u63A5,\u5408\u4F5C\u89C6\u9891\u94FE\u63A5\n" + items.map(cr => "\"" + cr.channelTitle + "\",\"" + (cr.country || "") + "\",\"" + cr.channelUrl + "\",\"" + cr.videoUrl + "\"").join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "\u5DF2\u9009\u4E2D\u535A\u4E3B_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSearchChannels = useCallback(async (query: string, pageToken?: string, pageIdx?: number) => {
    if (!query.trim()) return;
    setChLoading(true);
    setChError(null);
    try {
      const result = await searchChannels(query, region || undefined, pageToken);
      let cards: ChannelDisplay[] = result.channels.items.map((ch) => ({
        id: ch.id,
        title: ch.snippet.title,
        avatar: ch.snippet.thumbnails.high?.url || ch.snippet.thumbnails.default?.url,
        subscriberCount: ch.statistics.subscriberCount || "0",
        videoCount: ch.statistics.videoCount || "0",
        country: ch.snippet.country,
        channelUrl: "https://www.youtube.com/channel/" + ch.id,
      }));

      // Sort by subscriber count descending
      cards.sort((a, b) => parseInt(b.subscriberCount) - parseInt(a.subscriberCount));

      // Client-side region filter
      if (region) {
        cards = cards.filter((c) => matchesRegion(c.country, region));
      }

      setChannels(cards);
      setChQuery(query);
      setPgHasNext(!!result.search.nextPageToken);
      if (pageIdx !== undefined) {
        setPgTokens(prev => { const t = [...prev]; t[pageIdx + 1] = result.search.nextPageToken; return t; });
      }
      setPgIdx(pageIdx ?? 0);
    } catch (err: unknown) {
      setChError(err instanceof Error ? err.message : "\u641C\u7D22\u5931\u8D25");
    } finally {
      setChLoading(false);
    }
  }, [region, subRange, viewRange, videoType, sponsorFilter]);

  const handleSearchCreators = useCallback(async (query: string, pageToken?: string, pageIdx?: number) => {
    if (!query.trim()) return;
    setCrLoading(true);
    setCrError(null);
    try {
      const result = await searchGameCreators(query, pageToken);

      // Apply all filters
      let filtered = result.creators.filter((cr) => {
        if (isOfficialChannel(cr.channelTitle, query)) return false;
        if (region && !matchesRegion(cr.country, region)) return false;
        // Subscriber range filter
        if (subRange !== "all") {
          const s = parseInt(cr.subscriberCount);
          if (subRange === "0-1000" && s >= 1000) return false;
          if (subRange === "1000-10000" && (s < 1000 || s >= 10000)) return false;
          if (subRange === "10000-1000000" && (s < 10000 || s >= 1000000)) return false;
          if (subRange === "1000000+" && s < 1000000) return false;
        }
        // View count range filter
        if (viewRange !== "all") {
          const v = parseInt(cr.videoViewCount);
          if (viewRange === "0-1000" && v >= 1000) return false;
          if (viewRange === "1000-10000" && (v < 1000 || v >= 10000)) return false;
          if (viewRange === "10000-1000000" && (v < 10000 || v >= 1000000)) return false;
          if (viewRange === "1000000+" && v < 1000000) return false;
        }
        // Video type filter
        if (videoType === "video" && cr.isShort) return false;
        if (videoType === "short" && !cr.isShort) return false;
        // Sponsor filter
        if (sponsorFilter === "sponsored" && !cr.isSponsored) return false;
        if (sponsorFilter === "non-sponsored" && cr.isSponsored) return false;
        return true;
      });

      // Sort filtered results by view count descending
      filtered.sort((a, b) => parseInt(b.videoViewCount) - parseInt(a.videoViewCount));
      console.log("searchGameCreators returned", result.creators.length, "creators, filtered to", filtered.length);
      setCreators(filtered);
      setCrQuery(query);
      setCrHasSearched(true);
      setPgHasNext(!!result.nextPageToken);
      if (pageIdx !== undefined) {
        setPgTokens(prev => { const t = [...prev]; t[pageIdx + 1] = result.nextPageToken; return t; });
      }
      setPgIdx(pageIdx ?? 0);
    } catch (err: unknown) {
      setCrError(err instanceof Error ? err.message : "\u641C\u7D22\u5931\u8D25");
    } finally {
      setCrLoading(false);
    }
  }, [region]);

  const handleTabSearch = useCallback((query: string) => {
    setPgTokens([undefined]);
    setPgIdx(0);
    setPgHasNext(false);
    if (tab === "influencer") {
      handleSearchChannels(query, undefined, 0);
    } else {
      handleSearchCreators(query, undefined, 0);
    }
  }, [tab, handleSearchChannels, handleSearchCreators]);

  return (
    <div className="min-h-screen bg-gradient-to-b relative from-amber-50/50 to-amber-100/30"><div className="bg-mesh"><div className="orb-3" /></div>
      <Header tab={tab} onTabChange={setTab} />
      <main className="max-w-7xl mx-auto px-4 pb-12 relative z-10">
        <div className="mb-8">
          <SearchBar
            placeholder={tab === "influencer" ? L.searchPlace : L.gamePlace}
            tab={tab}
            regionCode={region}
            onRegionChange={setRegion}
            onSearch={handleTabSearch}
          />
        </div>
        {/* Error */}
        {(chError && tab === "influencer") && (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-lg border border-red-200">
              <span className="font-medium">{chError}</span>
            </div>
          </div>
        )}
        {(crError && tab === "videos") && (
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-lg border border-red-200">
              <span className="font-medium">{crError}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Channel Results */}
        {tab === "influencer" && (
          <>
            {chLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : channels.length > 0 ? (
              <>
                <div className="text-sm text-slate-500 mb-4">
                  {L.chResult.replace("{n}", String(channels.length))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {channels.map((ch, i) => <div key={ch.id} className="animate-fade-up" style={{animationDelay:(i*40)+"ms"}}><ChannelCard channel={ch} /></div>)}
                </div>
                <Pagination
                  currentPage={pgIdx + 1}
                  hasNext={pgHasNext}
                  hasPrev={pgIdx > 0}
                  maxVisited={pgTokens.length}
                  onPageChange={(page) => {
                    window.scrollTo({top: 0, behavior: "smooth"});
                    const idx = page - 1;
                    handleSearchChannels(chQuery, pgTokens[idx], idx);
                  }}
                  loading={chLoading}
                />
              </>
            ) : !chLoading && chError === null ? (
              <div className="text-center py-16 text-slate-400">
                <p>{L.noResults}</p>
              </div>
            ) : null}
          </>
        )}

        {/* Tab 2 Filters */}
        {tab === "videos" && (
          <>
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-6 -mt-2">
            <select value={subRange} onChange={e => setSubRange(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="all">{'\u7C89\u4E1D\u91CF\uFF1A\u5168\u90E8'}</option>
              <option value="0-1000">0 - 1K</option>
              <option value="1000-10000">{'1K - 1\u4E07'}</option>
              <option value="10000-1000000">{'1\u4E07 - 100\u4E07'}</option>
              <option value="1000000+">{'100\u4E07+'}</option>
            </select>
            <select value={viewRange} onChange={e => setViewRange(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="all">{'\u64AD\u653E\u91CF\uFF1A\u5168\u90E8'}</option>
              <option value="0-1000">0 - 1K</option>
              <option value="1000-10000">{'1K - 1\u4E07'}</option>
              <option value="10000-1000000">{'1\u4E07 - 100\u4E07'}</option>
              <option value="1000000+">{'100\u4E07+'}</option>
            </select>
            <select value={videoType} onChange={e => setVideoType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="all">{'\u89C6\u9891\u7C7B\u578B\uFF1A\u5168\u90E8'}</option>
              <option value="video">YouTube Video</option>
              <option value="short">Shorts</option>
            </select>
            <select value={sponsorFilter} onChange={e => setSponsorFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="all">{'\u8D5E\u52A9\u6807\u8BBE\uFF1A\u5168\u90E8'}</option>
              <option value="sponsored">{'\u6709\u8D5E\u52A9'}</option>
              <option value="non-sponsored">{'\u975E\u8D5E\u52A9'}</option>
            </select>
          </div>

            {crLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCreatorCard key={i} />)}
              </div>
            ) : creators.length > 0 ? (
              <>
                <div className="text-sm text-slate-500 mb-4">
                  {L.crResult.replace("{n}", String(creators.length))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {creators.map((cr, i) => <div key={cr.channelId} className="animate-fade-up" style={{animationDelay:(i*30)+"ms"}}><GameCreatorCard creator={cr} isSelected={!!selected[cr.channelId]} onToggle={toggleSelect} /></div>)}
                </div>
                <Pagination
                  currentPage={pgIdx + 1}
                  hasNext={pgHasNext}
                  hasPrev={pgIdx > 0}
                  maxVisited={pgTokens.length}
                  onPageChange={(page) => {
                    window.scrollTo({top: 0, behavior: "smooth"});
                    const idx = page - 1;
                    handleSearchCreators(crQuery, pgTokens[idx], idx);
                  }}
                  loading={crLoading}
                />
              </>
            ) : crHasSearched && !crLoading && crError === null ? (
              <div className="text-center py-16 text-slate-400">
                <p>{L.noResults}</p>
              </div>
            ) : null}
          </>
        )}
      {/* Selection bar */}
      {Object.values(selected).filter(Boolean).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg z-50 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {'\u5DF2\u9009\u4E2D'} <strong className="text-primary-600">{Object.values(selected).filter(Boolean).length}</strong> {'\u4E2A\u535A\u4E3B'}
          </span>
          <div className="flex gap-3">
            <button onClick={() => setSelected({})}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
              {'\u53D6\u6D88\u9009\u62E9'}
            </button>
            <button onClick={exportSelected}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-1.5">
              {'\u5BFC\u51FA'} Excel
            </button>
          </div>
        </div>
      )}
      </main>

      <footer className="text-center text-slate-400 text-sm py-8 border-t border-amber-200/60 bg-white/60 relative z-10">
        {L.footer}
      </footer>
    </div>
  );
}

