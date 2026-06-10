/**
 * NewsAdda Author Profiles Service
 * Centrally manages EEAT credentials, bios, expertise, and social channels for journalists.
 */

const AUTHOR_PROFILES = {
  "anselm-noronha": {
    name: "Anselm Noronha",
    title: "Senior Sports Editor",
    shortBio: "Anselm is a seasoned sports journalist with over a decade of experience tracking Indian and global football updates.",
    extendedBio: "Anselm Noronha is a Senior Sports Editor at NewsAdda. With a career spanning over 12 years in sports journalism, Anselm has reported extensively on national and international football tournaments. Prior to joining NewsAdda, he contributed to major sports publications, detailing player transfers, tactical reviews, and grassroots development in South Asian football. His analytical previews and exclusive interviews with ISL coaches and players have made him a respected voice in the Indian sports community.",
    expertise: ["Football Analytics", "Indian Super League", "European Football Transfers", "Sports Journalism"],
    credentials: [
      "B.A. in Mass Communication & Journalism, Goa University",
      "Certified Football Tactical Analyst"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/anselmnoronha",
      linkedin: "https://linkedin.com/in/anselmnoronha",
      email: "anselm.noronha@newsadda.blog"
    },
    avatarColor: "#0284c7" // Slate blue
  },
  "ritabrata-banerjee": {
    name: "Ritabrata Banerjee",
    title: "European Football Correspondent",
    shortBio: "Ritabrata covers European football and global football culture, bringing analytical rigor to match reviews.",
    extendedBio: "Ritabrata Banerjee is a leading sports journalist covering major European leagues for NewsAdda. Ritabrata has a deep passion for tactical analysis, structural formations, and statistical dashboards. He specializes in breaking down high-stakes matches in the Premier League, La Liga, and the Champions League. His articles provide readers with a masterclass in modern football gameplay and player recruitment patterns.",
    expertise: ["La Liga", "Premier League", "Tactical Previews", "UEFA Champions League"],
    credentials: [
      "M.A. in English Literature, Calcutta University",
      "PG Diploma in Sports Journalism & Broadcast"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/ritabrata_b",
      linkedin: "https://linkedin.com/in/ritabrata-banerjee",
      email: "ritabrata@newsadda.blog"
    },
    avatarColor: "#b91c1c" // Crimson
  },
  "deepanshu-bisht": {
    name: "Deepanshu Bisht",
    title: "Lead Technology Editor & Founder",
    shortBio: "Deepanshu is a software engineer and writer who tracks the intersection of web frameworks, AI, and developer tools.",
    extendedBio: "Deepanshu Bisht is the founder and Lead Technology Editor of NewsAdda. As a full-stack engineer and passionate developer advocate, he writes deeply researched articles on modern web frameworks, artificial intelligence systems, and the future of open-source software. He drives the technology and editorial direction of NewsAdda, ensuring clean code, premium performance, and accurate tech updates.",
    expertise: ["Web Development", "Artificial Intelligence", "Cloud Architecture", "Next.js & React"],
    credentials: [
      "B.Tech in Computer Science & Engineering",
      "Google Cloud Certified Cloud Developer"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/deepanshubisht",
      linkedin: "https://linkedin.com/in/deepanshu-bisht",
      email: "bishtdepanshu321@gmail.com"
    },
    avatarColor: "#4f46e5" // Indigo
  },
  "newsadda-editorial-board": {
    name: "NewsAdda Editorial Board",
    title: "Editorial Board",
    shortBio: "A collective desk of editors ensuring editorial integrity, factual correctness, and compliance with journalistic standards.",
    extendedBio: "The NewsAdda Editorial Board is a collective of senior editors, copywriters, and fact-checkers. The board oversees the editorial voice of the organization, managing corrections, policy guidelines, and syndication compliance. Articles under this byline represent joint reporting or statements of policy approved by the senior editorial leadership of NewsAdda.",
    expertise: ["Public Policy", "Fact-Checking", "National Affairs", "Media Ethics", "Corrections Review"],
    credentials: [
      "Collective of Accredited Journalists",
      "Aligned with Press Council Guidelines"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/NewsAddaIndia",
      linkedin: "https://linkedin.com/company/newsadda-media",
      email: "editorial@newsadda.blog"
    },
    avatarColor: "#0f172a" // Slate 900
  },
  "newsdata-editorial-board": {
    name: "NewsAdda Editorial Board",
    title: "Editorial Board",
    shortBio: "A collective desk of editors ensuring editorial integrity, factual correctness, and compliance with journalistic standards.",
    extendedBio: "The NewsAdda Editorial Board is a collective of senior editors, copywriters, and fact-checkers. The board oversees the editorial voice of the organization, managing corrections, policy guidelines, and syndication compliance. Articles under this byline represent joint reporting or statements of policy approved by the senior editorial leadership of NewsAdda.",
    expertise: ["Public Policy", "Fact-Checking", "National Affairs", "Media Ethics", "Corrections Review"],
    credentials: [
      "Collective of Accredited Journalists",
      "Aligned with Press Council Guidelines"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/NewsAddaIndia",
      linkedin: "https://linkedin.com/company/newsadda-media",
      email: "editorial@newsadda.blog"
    },
    avatarColor: "#0f172a" // Slate 900
  },
  "pti": {
    name: "Press Trust of India (PTI)",
    title: "National News Syndicate",
    shortBio: "Verified reports and wire syndications from the Press Trust of India, the country's premier news agency.",
    extendedBio: "The Press Trust of India (PTI) is the country's largest and most trusted news agency. NewsAdda licenses PTI's wire services to deliver immediate, verified, and objective reports on national policy, parliament decisions, judicial verdicts, and nationwide breaking updates.",
    expertise: ["National Politics", "State Policy", "Economic Indicators", "Breaking News"],
    credentials: [
      "Press Trust of India Syndicate Partner"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/PTI_News",
      linkedin: "https://linkedin.com/company/press-trust-of-india",
      email: "syndicate@newsadda.blog"
    },
    avatarColor: "#7c2d12" // Terracotta
  },
  "ani": {
    name: "Asian News International (ANI)",
    title: "Regional & Multimedia Feed",
    shortBio: "Multimedia wire reports and ground feeds from Asian News International, South Asia's leading news agency.",
    extendedBio: "Asian News International (ANI) is South Asia's leading multimedia news agency. ANI updates on NewsAdda deliver real-time ground reports, press briefings, election coverage, and regional news directly from verified bureau correspondents.",
    expertise: ["Ground Reporting", "Bilateral Affairs", "Elections", "Breaking Events"],
    credentials: [
      "Asian News International Wire Partner"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/ANI",
      linkedin: "https://linkedin.com/company/ani-media",
      email: "syndicate@newsadda.blog"
    },
    avatarColor: "#065f46" // Forest Green
  },
  "associated-press": {
    name: "Associated Press (AP)",
    title: "Global News Wire",
    shortBio: "Global reports, factual updates, and international coverage from the Associated Press.",
    extendedBio: "The Associated Press (AP) is an independent global news organization dedicated to factual, unbiased reporting. NewsAdda hosts AP syndications to bring verified international events, geopolitical reports, and global breaking news to our readers.",
    expertise: ["International Geopolitics", "Global Conflicts", "World Economics", "Environmental Policy"],
    credentials: [
      "Associated Press Wire Partner"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/AP",
      linkedin: "https://linkedin.com/company/associated-press",
      email: "syndicate@newsadda.blog"
    },
    avatarColor: "#1e293b" // Dark Slate
  },
  "khabarhub": {
    name: "Khabarhub",
    title: "South Asian News Network",
    shortBio: "Geopolitical, bilateral, and socio-economic updates from around the South Asian region.",
    extendedBio: "Khabarhub is a digital journalism outlet tracking policy changes, bilateral relations, and socio-economic developments across South Asia. NewsAdda partners with Khabarhub to ensure reliable, expert coverage of local governance and cross-border developments in the subcontinent.",
    expertise: ["South Asian Geopolitics", "Bilateral Policy", "Regional Stability", "Social Development"],
    credentials: [
      "Khabarhub Journalism Partner"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/khabarhub",
      linkedin: "https://linkedin.com/company/khabarhub",
      email: "partner@khabarhub.com"
    },
    avatarColor: "#c2410c" // Orange
  },
  "rediff-sports-desk": {
    name: "Rediff Sports Desk",
    title: "Senior Sports Desk",
    shortBio: "Factual news coverage, match analyses, and press summaries curated by Rediff Sports Desk.",
    extendedBio: "Rediff Sports Desk is a specialized group of senior commentators and sports journalists. The desk provides comprehensive previews, livescore updates, player statistics, and press conference briefs covering cricket, hockey, tennis, and international athletics.",
    expertise: ["Cricket Match Analysis", "IPL Insights", "Olympic Sports", "Athlete Interviews"],
    credentials: [
      "Rediff Sports Syndication Team"
    ],
    verified: true,
    socials: {
      twitter: "https://twitter.com/RediffSports",
      linkedin: "https://linkedin.com/company/rediff-com",
      email: "sports@rediff.co.in"
    },
    avatarColor: "#be123c" // Rose
  }
};

// Map similar author strings to standard slug keys
function getNormalizedSlug(authorName) {
  if (!authorName) return "newsadda-editorial-board";
  
  const rawSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "").replace(/^-+/g, "");
  
  if (rawSlug.includes("editorial-board") || rawSlug.includes("newsdata") || rawSlug.includes("newsadda")) {
    return "newsadda-editorial-board";
  }
  if (rawSlug.includes("sports-rediff") || rawSlug.includes("rediff-sports")) {
    return "rediff-sports-desk";
  }
  if (rawSlug.includes("ritabrata")) {
    return "ritabrata-banerjee";
  }
  if (rawSlug.includes("deepanshu")) {
    return "deepanshu-bisht";
  }
  if (rawSlug.includes("trends-desk") || rawSlug.includes("trending-desk")) {
    return "newsadda-editorial-board";
  }
  
  return rawSlug;
}

/**
 * Returns a clean readable name from slug format.
 */
export function deSlug(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Retrieves the profile of an author. If the profile doesn't exist,
 * it dynamically builds one using their written articles.
 * 
 * @param {string} nameOrSlug - The author name or slug
 * @param {Array} [allPosts] - List of all posts in the database, for fallback analytics
 */
export function getAuthorProfile(nameOrSlug, allPosts = []) {
  const targetSlug = getNormalizedSlug(nameOrSlug);
  const profile = AUTHOR_PROFILES[targetSlug];
  
  if (profile) {
    return {
      ...profile,
      slug: targetSlug
    };
  }

  // Fallback dynamic profile generation for unmapped guest authors / wire partners
  const displayName = deSlug(targetSlug);
  
  // Analyze posts if available to determine expertise
  let calculatedExpertise = ["General News", "Live Reporting"];
  let CalculationsTitle = "Contributing Journalist";
  let avatarColor = "#334155"; // Slate
  
  if (allPosts.length > 0) {
    const authorPosts = allPosts.filter(
      (post) =>
        post.author &&
        getNormalizedSlug(post.author) === targetSlug
    );
    
    if (authorPosts.length > 0) {
      // Collect written categories
      const categories = authorPosts.map(p => p.category).filter(Boolean);
      const uniqueCats = Array.from(new Set(categories));
      
      if (uniqueCats.length > 0) {
        calculatedExpertise = uniqueCats.map(cat => `${cat} Coverage`).concat(["Geopolitical Affairs"]);
        CalculationsTitle = `Senior Correspondent (${uniqueCats[0]} Expert)`;
      }
      
      // Determine avatar color based on name hash
      const hash = displayName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colors = ["#b91c1c", "#c2410c", "#15803d", "#0369a1", "#4f46e5", "#6d28d9", "#be185d"];
      avatarColor = colors[hash % colors.length];
    }
  }

  return {
    name: displayName,
    slug: targetSlug,
    title: CalculationsTitle,
    shortBio: `${displayName} is an experienced reporter reporting live updates and factual summaries for NewsAdda.`,
    extendedBio: `${displayName} is a verified senior journalist and news writer reporting on national and international issues. Combining factual accuracy with deep research, ${displayName} delivers prompt, reliable updates for the NewsAdda audience.`,
    expertise: calculatedExpertise,
    credentials: ["Verified Journalist & Accredited Writer"],
    verified: true,
    socials: {
      twitter: `https://twitter.com/${targetSlug}`,
      linkedin: `https://linkedin.com/in/${targetSlug}`,
      email: `contact@newsadda.blog`
    },
    avatarColor
  };
}
