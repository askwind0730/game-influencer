export function formatSubCount(count: string | undefined): string {
  const n = parseInt(count || "0");
  if (isNaN(n)) return "0";
  if (n >= 100000000) return (n / 100000000).toFixed(1) + "\u4EBF";
  if (n >= 10000) return (n / 10000).toFixed(1) + "\u4E07";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export function formatViewCount(count: string | undefined): string {
  const n = parseInt(count || "0");
  if (isNaN(n)) return "0";
  if (n >= 100000000) return (n / 100000000).toFixed(1) + "\u4EBF";
  if (n >= 10000) return (n / 10000).toFixed(1) + "\u4E07";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

export function getRegionLabel(country?: string): string {
  if (!country) return "";
  const regionMap: Record<string, string> = {
    US: "\u5317\u7F8E", CA: "\u5317\u7F8E",
    GB: "\u6B27\u6D32", DE: "\u6B27\u6D32", FR: "\u6B27\u6D32", ES: "\u6B27\u6D32", IT: "\u6B27\u6D32", NL: "\u6B27\u6D32",
    ID: "\u4E1C\u5357\u4E9A", TH: "\u4E1C\u5357\u4E9A", VN: "\u4E1C\u5357\u4E9A", MY: "\u4E1C\u5357\u4E9A", PH: "\u4E1C\u5357\u4E9A", SG: "\u4E1C\u5357\u4E9A",
    JP: "\u65E5\u97E9", KR: "\u65E5\u97E9",
    AE: "\u4E2D\u4E1C", SA: "\u4E2D\u4E1C", IL: "\u4E2D\u4E1C", TR: "\u4E2D\u4E1C",
    BR: "\u62C9\u7F8E", MX: "\u62C9\u7F8E", AR: "\u62C9\u7F8E", CL: "\u62C9\u7F8E",
  };
  return regionMap[country.toUpperCase()] || "";
}

export function getRegionColor(label: string): string {
  const colors: Record<string, string> = {
    "\u5317\u7F8E": "bg-blue-100 text-blue-700",
    "\u6B27\u6D32": "bg-indigo-100 text-indigo-700",
    "\u4E1C\u5357\u4E9A": "bg-emerald-100 text-emerald-700",
    "\u65E5\u97E9": "bg-rose-100 text-rose-700",
    "\u4E2D\u4E1C": "bg-amber-100 text-amber-700",
    "\u62C9\u7F8E": "bg-purple-100 text-purple-700",
  };
  return colors[label] || "bg-slate-100 text-slate-600";
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

// Region matching: check if a country code belongs to a selected region
export function matchesRegion(country: string | undefined, regionCode: string): boolean {
  if (!regionCode || regionCode === "") return true; // "all" region
  if (!country) return true; // channels without country info: show anyway
  
  const regionCountryMap: Record<string, string[]> = {
    US: ["US", "CA"],
    GB: ["GB", "DE", "FR", "ES", "IT", "NL", "PT", "SE", "NO", "DK", "FI", "PL", "CH", "AT", "BE", "IE"],
    ID: ["ID", "TH", "VN", "MY", "PH", "SG", "MM", "KH", "LA", "BN"],
    JP: ["JP", "KR"],
    AE: ["AE", "SA", "IL", "TR", "QA", "KW", "OM", "BH", "JO", "LB"],
    BR: ["BR", "MX", "AR", "CL", "CO", "PE", "UY", "PY", "BO", "EC"],
  };

  const allowed = regionCountryMap[regionCode];
  if (!allowed) return true;
  return allowed.includes(country.toUpperCase());
}

// Heuristic to detect official game channels
export function isOfficialChannel(channelName: string, searchQuery: string): boolean {
  const name = channelName.toLowerCase().trim();
  const query = searchQuery.toLowerCase().trim();

  // 1. Name contains "official"
  if (/\bofficial\b/.test(name)) return true;

  // 2. Name exactly matches the game name
  if (name === query) return true;

  // 3. Name = query + official suffix
  if (name === query + " official") return true;

  // 4. Name has same words as query (same set) - likely official brand channel
  const queryWords = query.split(/\s+/).filter(w => w.length > 0);
  const nameWords = name.split(/\s+/).filter(w => w.length > 0);
  if (queryWords.every(w => name.includes(w))) {
    // Channel name contains all query words
    // 4a. If channel has exactly the same words as query (in any order), its official
    const sameWords = queryWords.every(qw => nameWords.some(nw => nw === qw));
    if (sameWords && nameWords.length === queryWords.length) return true;

    // 4b. Known publisher keywords
    const publishers = [
      "mihoyo", "hoyoverse", "tencent", "netease", "riot games", "blizzard",
      "playstation", "xbox", "nintendo", "electronic arts", "ubisoft",
      "square enix", "capcom", "bandai namco", "sega", "konami",
      "activision", "epic games", "bungie", "bethesda", "rockstar",
      "cd projekt", "mojang", "supercell",
    ];
    for (const pub of publishers) {
      if (name.includes(pub)) return true;
    }

    // 4c. Short channel name with common official suffix patterns
    if (nameWords.length <= 4 && nameWords.length > queryWords.length) {
      const extraWords = nameWords.filter(nw => !queryWords.includes(nw));
      const officialSuffixes = ["global", "game", "games", "inc", "corp", "llc", "entertainment", "studios", "studio", "media", "tv", "network", "world", "live", "official", "en", "jp", "cn", "kr", "tw", "sea", "asia", "europe", "na", "intl", "international"];
      if (extraWords.some(w => officialSuffixes.includes(w))) return true;
    }
  }

  // 5. Name contains query as full substring AND has very few extra words (likely official mirror)
  if (name.includes(query) && name.length < query.length + 10) return true;

  return false;
}
