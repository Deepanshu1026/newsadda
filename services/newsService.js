export async function fetchLatestNews(category = "technology", language = "en") {
  const newsApiKey = process.env.NEWS_API_KEY;
  const newsDataApiKey = process.env.NEWSDATA_API_KEY;

  if (!newsApiKey && !newsDataApiKey) {
    console.log("[News Service] Both API keys are missing. Utilizing rich fallback feeds.");
    return getFallbackHeadlines(category);
  }

  let newsApiArticles = [];
  let newsDataArticles = [];

  // 1. Query NewsAPI if key is configured (NewsAPI only supports a handful of languages; skip for non-English)
  if (newsApiKey && language === "en") {
    try {
      const isStandardCategory = ["business", "entertainment", "general", "health", "science", "sports", "technology"].includes(category.toLowerCase());
      let url;
      if (isStandardCategory) {
        console.log(`[News Service] Fetching NewsAPI standard category: ${category} (India)`);
        url = `https://newsapi.org/v2/top-headlines?country=in&category=${category}&language=en&apiKey=${newsApiKey}`;
      } else {
        console.log(`[News Service] Fetching NewsAPI custom query: ${category} (India)`);
        const queryTerm = category.toLowerCase().includes("india") ? category : `${category} India`;
        url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(queryTerm)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          newsApiArticles = data.articles
            .filter(art => art.title && art.description && art.title !== "[Removed]")
            .map((art, idx) => ({
              title: art.title,
              description: art.description,
              source: art.source?.name || "NewsAdda India Desk",
              url: art.url || `https://example.com/news-${idx}`,
              author: art.author || "NewsAdda Editorial Board",
              publishedAt: art.publishedAt || new Date().toISOString(),
              image: art.urlToImage || null
            }));
          console.log(`[News Service] Successfully retrieved ${newsApiArticles.length} articles from NewsAPI`);
        } else {
          console.warn(`[News Service] NewsAPI returned no articles for category: ${category}`);
        }
      } else {
        const errText = await response.text();
        console.warn(`[News Service] NewsAPI returned status ${response.status}: ${errText}`);
      }
    } catch (error) {
      console.error("[News Service] Error fetching from NewsAPI:", error.message);
    }
  }

  // 2. Query NewsData.io if key is configured
  if (newsDataApiKey) {
    try {
      console.log(`[News Service] Querying NewsData.io for category: ${category} (India, lang=${language})`);
      const url = `https://newsdata.io/api/1/latest?apikey=${newsDataApiKey}&q=${encodeURIComponent(category)}&country=in&language=${language}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          newsDataArticles = data.results
            .filter(art => art.title && art.title !== "[Removed]")
            .map((art, idx) => ({
              title: art.title,
              description: art.description || art.content || "Latest news update.",
              source: art.source_name || art.source_id || "NewsData.io Feed",
              url: art.link || `https://example.com/newsdata-${idx}`,
              author: (Array.isArray(art.creator) ? art.creator.join(", ") : art.creator) || "NewsData Editorial Board",
              publishedAt: art.pubDate || new Date().toISOString(),
              image: art.image_url || null
            }));
          console.log(`[News Service] Successfully retrieved ${newsDataArticles.length} articles from NewsData.io`);
        } else {
          console.warn(`[News Service] NewsData.io returned no articles for category: ${category}`);
        }
      } else {
        const errText = await response.text();
        console.warn(`[News Service] NewsData.io returned status ${response.status}: ${errText}`);
      }
    } catch (error) {
      console.error("[News Service] Error fetching from NewsData.io:", error.message);
    }
  }

  // 3. Combine and Deduplicate
  const combined = [...newsApiArticles, ...newsDataArticles];
  if (combined.length === 0) {
    console.warn(`[News Service] Unified query for "${category}" yielded zero articles. Falling back.`);
    return getFallbackHeadlines(category);
  }

  const uniqueArticles = [];
  const seenTitles = new Set();

  for (const art of combined) {
    const normalizedTitle = art.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
    
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueArticles.push(art);
    }
  }

  console.log(`[News Service] Ingestion pipeline extracted ${uniqueArticles.length} unique articles (de-duplicated from ${combined.length} raw items)`);
  return uniqueArticles;
}

function getFallbackHeadlines(category) {
  const normalizedCategory = category.toLowerCase().trim();

  const cricketFallbacks = [
    {
      title: "Team India Dominates ICC Test Championship Rankings Following Historic series Win",
      description: "Indian Cricket Team secures the top spot in the Test table after a spectacular batting display by young talents in the final matches.",
      source: "Cricbuzz",
      author: "Harsha Bhogle",
      publishedAt: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1531415080290-bc98545ab2ef?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Indian Premier League (IPL) 2026: Franchise Owners Align on Major Auction Rules",
      description: "Exciting new roster retentions and revised salary caps set the stage for an explosive mega auction in the upcoming seasonal games.",
      source: "ESPN Cricinfo",
      author: "Sidharth Monga",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      image: "https://images.unsplash.com/photo-1540747737956-37872404a8de?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const viralFallbacks = [
    {
      title: "Bengaluru Techie's AI-Powered Chai Stall Goes Viral Across Social Media Platforms",
      description: "A customized automated tea brewing robot controlled via mobile app logs thousands of customers and starts franchising globally.",
      source: "Hindustan Times",
      author: "Shreya Sharma",
      publishedAt: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Mumbai Local Train Classical Dance Performance Wins Millions of Hearts Globally",
      description: "A spontaneous flash mob performing traditional Bharatnatyam on the platform provides commuters with a heartwarming cultural showcase.",
      source: "NDTV India",
      author: "Aditi Rao",
      publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const fashionFallbacks = [
    {
      title: "Sustainable Khadi Re-imagined: Indian Designers Showcase Eco-Couture at Paris Fashion Week",
      description: "Modern silhouettes woven with organic Indian cotton win global accolades, starting a major sustainable fashion trend for 2026.",
      source: "Vogue India",
      author: "Bandana Tewari",
      publishedAt: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "The Return of Royal Handlooms: Youth Demands Spark Traditional Saree Revivals",
      description: "Banarasi and Kanjeevaram weaves witness a dramatic surge in weddings and daily styling as Gen-Z embraces cultural heritage fashion.",
      source: "The Indian Express",
      author: "Meenakshi Iyer",
      publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const politicalFallbacks = [
    {
      title: "Parliament Passes landmark Digitization and Data Protection Act for Indian Citizens",
      description: "Major bi-partisan consensus drives the implementation of strict data localization guidelines and unified digital privacy protections.",
      source: "The Times of India",
      author: "Rajesh Kumar",
      publishedAt: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "State Elections 2026: Counting Begins Under High-Security Digitized Ballot Protocols",
      description: "The Election Commission implements real-time online dashboard telemetry and blockchain verification grids to track voting audits.",
      source: "India Today",
      author: "Rahul Kanwal",
      publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const techFallbacks = [
    {
      title: "India's AI Startup Scene Skyrockets as Bengaluru Hub Attracts Record Global Venture Capital",
      description: "Indian artificial intelligence developers secure massive seed funding rounds from top Silicon Valley venture funds to build localized LLMs.",
      source: "TechCrunch",
      author: "Manish Singh",
      publishedAt: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const crimeFallbacks = [
    {
      title: "Delhi Police Deploy Advanced Facial Recognition Systems to Curb Crime in Public Markets",
      description: "Smart visual telemetry grids and mobile inspection modules are introduced in major city bazaars to audit security databases in real-time.",
      source: "The Hindu",
      author: "Alok Singh",
      publishedAt: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Mumbai Cyber Cell Warns Citizens Against Sophisticated UPI Refund Scam Networks",
      description: "Authorities raise alerts detailing fake transactional refund links circulated via social media applications to access mobile payment accounts.",
      source: "NDTV India",
      author: "Saurabh Gupta",
      publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  if (normalizedCategory.includes("cricket")) return cricketFallbacks;
  if (normalizedCategory.includes("viral")) return viralFallbacks;
  if (normalizedCategory.includes("fashion")) return fashionFallbacks;
  if (normalizedCategory.includes("polit") || normalizedCategory.includes("govt")) return politicalFallbacks;
  if (normalizedCategory.includes("crime")) return crimeFallbacks;
  return techFallbacks;
}

export async function searchNewsForHeadline(headline, language = "en") {
  const newsApiKey = process.env.NEWS_API_KEY;
  const newsDataApiKey = process.env.NEWSDATA_API_KEY;

  if (!newsApiKey && !newsDataApiKey) {
    console.log("[News Service] No news search API keys configured. Using blank search results.");
    return [];
  }

  // Refine and clean query by stripping special chars, then taking the first 6 words for relevance
  const query = headline
    .replace(/[^\w\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(" ");

  if (!query) return [];

  console.log(`[News Service] Performing background search for: "${query}" (lang=${language})`);
  let articles = [];

  // Try NewsAPI everything search (NewsAPI only supports limited languages; skip for non-English)
  if (newsApiKey && language === "en") {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevance&pageSize=4&apiKey=${newsApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          articles = data.articles.map(art => ({
            title: art.title,
            description: art.description || art.content || ""
          }));
          console.log(`[News Service] Search retrieved ${articles.length} articles from NewsAPI`);
        }
      }
    } catch (error) {
      console.warn("[News Service] Search NewsAPI failed:", error.message);
    }
  }

  // Fallback to NewsData search if needed
  if (articles.length === 0 && newsDataApiKey) {
    try {
      const url = `https://newsdata.io/api/1/latest?apikey=${newsDataApiKey}&q=${encodeURIComponent(query)}&language=${language}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          articles = data.results.slice(0, 4).map(art => ({
            title: art.title,
            description: art.description || art.content || ""
          }));
          console.log(`[News Service] Search retrieved ${articles.length} articles from NewsData.io`);
        }
      }
    } catch (error) {
      console.warn("[News Service] Search NewsData.io failed:", error.message);
    }
  }

  return articles.filter(art => art.title && art.description);
}

