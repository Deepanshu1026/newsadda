const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../database.json");
const envPath = path.join(__dirname, "../.env");

// 1. Load environment variables from .env
console.log("[Original Articles] Loading environment variables from .env...");
if (!fs.existsSync(envPath)) {
  console.error("[Original Articles] Error: .env file not found!");
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const firestoreProjectId = env.FIRESTORE_PROJECT_ID || "auth-5ccab";
const firestoreApiKey = env.FIRESTORE_API_KEY || "AIzaSyAU7ldBTC2wAS6zdp8K7LkUnk0ghEsHePs";

// 2. Define our original articles
const originalArticles = [
  {
    id: "spin-trap-tactics-india-cricket-middle-overs",
    title: "Strategic Chess: How India's Spin Trap in the Middle Overs is Deciding T20 Outcomes",
    description: "An in-depth tactical analysis of how India's spin department squeezes run rates and forces errors during the crucial middle overs of T20 Internationals.",
    category: "Cricket",
    image: "https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=1200&auto=format&fit=crop",
    author: "Anselm Noronha",
    language: "en",
    content: `### Introduction

In modern T20 cricket, the powerplay gets the highlight reels and the death overs get the drama. But ask any tactician, and they'll tell you that matches are won or lost in the quiet squeeze of the middle overs. Recently, the Indian men's cricket team has turned this phase into an absolute chokehold. By deploying a highly calculated "spin trap" between overs 7 and 15, India is systematically dismantling opposition batting line-ups not with raw pace, but with strategic chess.

### Context

During the recent international series, opposing teams frequently got off to explosive starts in the powerplay, only to collapse in the middle phase. This pattern isn't accidental; it is a designed trap. As soon as the field spreads, India's spin duo takes over, transforming a fast-scoring pitch into a minefield of variable bounce and subtle angle changes.

### Background Information

For years, T20 bowling was about survival—containing damage until the death bowlers could execute yorkers. However, under the current coaching staff, India has shifted to an aggressive wicket-taking model in the middle overs. Rather than bowl defensive flat lines, India's spinners are encouraged to loop the ball, utilize crease width, and build dot-ball pressure that forces batsmen into low-probability boundary options.

### Analysis

The mechanics of this trap rely on three distinct components:
1. **Length Control and Crease Width**: Spinners like Kuldeep Yadav are pitching the ball in the "uncertainty zone"—between 3.5 and 4.0 meters from the stumps—forcing batsmen to play off the back foot.
2. **Speed Variation**: By mixing slow, flighted deliveries (around 78-82 km/h) with quicker darted balls (90-95 km/h), they disrupt the batsman's swing timing.
3. **Smart Field Setups**: The placement of a deep backward square leg and a sweeping deep mid-wicket forces batsmen to hit against the spin if they want to clear the boundary, leading to top-edges.

> "Wickets in the middle overs are worth double because they stop the set batsman from reaching the death overs where they can do maximum damage."

### Key Takeaways
- Dot-ball pressure is the primary weapon, forcing risky shots.
- Length variation makes it impossible for batsmen to commit early.
- Matchups are heavily utilized, pitting left-arm wrist spin against right-handed bats.
- The wicketkeeper's input on batsman movement is crucial for pre-delivery adjustments.

### Conclusion

As the T20 World Cup approaches, India's middle-over spin trap remains their most reliable defensive weapon. If opposing teams cannot find a way to rotate strike and hit singles against this spin choke, India will continue to dominate the middle phase and dictate the outcome of high-stakes cricket tournaments.

### Trending SEO Keywords
- India spin bowling T20
- Kuldeep Yadav tactics
- cricket middle overs analysis
- Indian cricket team strategy
- T20 spin trap`,
    publishedAt: new Date().toISOString(),
    views: 0
  },
  {
    id: "demystifying-turbopack-nextjs-rust-compiler",
    title: "Demystifying Turbopack: Why Next.js 16 is Abandoning Webpack for Rust-Powered Build Tooling",
    description: "A deep dive into Turbopack, the incremental compiler built in Rust, explaining how it speeds up developer startup times and hot module replacement.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=1200&auto=format&fit=crop",
    author: "Deepanshu Bisht",
    language: "en",
    content: `### Introduction

For nearly a decade, Webpack has been the undisputed backbone of JavaScript bundlers. It helped transition the web from basic script tags to massive Single Page Applications. But as codebases grew to millions of lines, Webpack's performance started to bottleneck. Enter **Turbopack**—the Rust-based successor designed specifically for Next.js. With the release of Next.js 16, this Rust-powered build tool is officially replacing Webpack, promising massive performance improvements for developer startup times.

### Context

Modern web applications often have thousands of modules. In developer mode, waiting for Webpack to compile these modules on boot can take anywhere from 10 seconds to over a minute. Turbopack addresses this directly by compile-on-demand and incremental computation.

### Background Information

Webpack was written in JavaScript, which runs on a single thread and is subject to garbage collection pauses. As tools like SWC, esbuild, and Vite proved that native, multi-threaded languages like Rust and Go compile code 10x to 100x faster, the Vercel team began development on Turbopack to modernize Next.js build infrastructure.

### Analysis

Turbopack's speed isn't just about Rust; it's about architecture.
*   **Incremental Compilation**: Turbopack never does the same work twice. Once it compiles a function, it caches the result in memory.
*   **Function-Level Cache**: Instead of caching whole files, Turbopack caches the output of individual functions.
*   **Lazy Bundling**: It only compiles the exact modules needed for the page you are currently viewing. If you navigate to \`/about\`, only the components for \`/about\` are compiled.

\`\`\`javascript
// Example of dynamic import in Next.js to leverage lazy bundling
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('../components/HeavyChart'), {
  ssr: false,
  loading: () => <p>Loading dynamic module...</p>,
});
\`\`\`

> "Webpack was built for an era of simple bundles. Turbopack is built for the era of server-side routing and server components."

### Key Takeaways
- Rust enables multi-threaded compilation without garbage collection overhead.
- Function-level caching ensures lightning-fast hot module replacement.
- Lazy compilation compiles only active pages, saving dev machine memory.
- Full compatibility with the Next.js App Router paradigm.

### Conclusion

While Webpack will always hold a place in web history, Next.js 16's migration to Turbopack marks a major leap forward. For developers, this means no more waiting around for builds, resulting in smoother workflows and faster iteration times.

### Trending SEO Keywords
- Nextjs 16 Turbopack
- Rust bundler performance
- Turbopack vs Webpack speed
- Next.js compiler update
- modern web build tooling`,
    publishedAt: new Date().toISOString(),
    views: 0
  },
  {
    id: "illusion-of-choice-algorithmic-feed-optimization",
    title: "The Illusion of Choice in the Age of Recommendation Algorithms: How Feed Optimization is Reshaping Critical Thought",
    description: "An editorial essay examining the sociological impact of personalized content feeds, echo chambers, and the erosion of organic discovery.",
    category: "Opinion",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop",
    author: "NewsAdda Editorial Board",
    language: "en",
    content: `### Introduction

We wake up, grab our phones, and scroll. We believe we are making active choices: clicking articles, liking comments, and subscribing to newsletters. But are we really choosing, or are we just following breadcrumbs laid out by a feed optimization algorithm? The reality is that recommendation models have quietly shifted from helping us find content to telling us what to think. This subtle shift has massive implications for how we discover ideas and engage in critical analysis.

### Context

Almost every major website—whether it's a news dashboard, social media network, or streaming service—uses machine learning to maximize user engagement. Feeds are tuned to show users what they are most likely to click, creating a hyper-personalized bubble of information.

### Background Information

In the early days of the internet, discovery was organic. Users visited directories, bookmarked blogs, and read chronologically sorted feeds. But as the volume of digital content exploded, search engines and social platforms introduced sorting algorithms to organize the clutter. Over time, these algorithms transitioned from sorting tools to active gatekeepers of information.

### Analysis

The issue isn't just that feeds are personalized; it's that they optimize for engagement over value.
*   **The Outrage Bias**: Algorithms quickly learn that sensational, divisive content generates more comments and shares than balanced reporting.
*   **Echo Chambers**: By showing you opinions that align with your past behavior, the recommendation engine isolates you from dissenting viewpoints.
*   **The Loss of Serendipity**: Organic discovery—stumbling upon an article or a concept you didn't know you liked—is replaced by a predictable stream of calculated recommendations.

> "When an algorithm decides what you read, it also decides what questions you ask."

### Key Takeaways
- Recommendation algorithms optimize for user screen time, not critical truth.
- Echo chambers polarize opinions by systematically filtering out opposing views.
- Natural discovery is replaced by feedback loops of calculated content.
- Critical thinking requires actively seeking out non-optimized, raw sources.

### Conclusion

Breaking free from algorithmic curation requires conscious effort. We must deliberately seek out independent publications, check references, and occasionally read opinions we disagree with. Only by breaking the loop can we reclaim our intellectual autonomy.

### Trending SEO Keywords
- algorithm bias social media
- recommendation systems echo chambers
- algorithmic feed optimization
- media literacy in digital age
- organic content discovery`,
    publishedAt: new Date().toISOString(),
    views: 0
  },
  {
    id: "optimizing-nextjs-core-web-vitals-lcp-cls",
    title: "Building for the Core Web Vitals: A Step-by-Step Guide to Optimizing Next.js LCP and Cumulative Layout Shift",
    description: "A technical tutorial walking through code splitting, performance images, and placeholder reservations to achieve a 100/100 Lighthouse score in Next.js.",
    category: "Tutorials",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    author: "Deepanshu Bisht",
    language: "en",
    content: `### Introduction

Google's Core Web Vitals are no longer just performance guidelines—they are critical factors for SEO ranking. Among them, **Largest Contentful Paint (LCP)** and **Cumulative Layout Shift (CLS)** are the most common bottlenecks for modern web apps. Even in Next.js, which is built for speed, poorly optimized images or unreserved ad spaces can cause your page speed score to plummet. Here is a step-by-step guide to fixing these bottlenecks and achieving a green Lighthouse score.

### Context

A site that loads fast but shifts around as elements load frustrates users and gets penalized by search engines. This tutorial focuses on how to keep your layout stable and optimize LCP elements using Next.js build practices.

### Background Information

Historically, developers relied on client-side JS to measure and optimize load times, but this didn't account for real-world devices. Google's Core Web Vitals measure user experience metrics directly from Chrome browsers, making real-world optimizations like layout stability essential.

### Analysis

Let's break down the optimization steps:

#### Step 1: Optimize your Largest Contentful Paint (LCP)
Your LCP is usually the main hero image or article banner. To speed up its load time, make sure it is prioritized during server pre-rendering.
\`\`\`javascript
// Using next/image with priority flag to force eager loading
import Image from 'next/image';

export default function ArticleHero() {
  return (
    <div className="hero-container">
      <Image
        src="/images/hero-banner.jpg"
        alt="Optimized Banner"
        width={1200}
        height={675}
        priority={true} // Informs Next.js to pre-load this image
        placeholder="blur"
        blurDataURL="data:image/png;base64,..."
      />
    </div>
  );
}
\`\`\`

#### Step 2: Prevent Cumulative Layout Shift (CLS)
CLS happens when dynamic elements (like ads, images, or widgets) load without pre-reserved height, shifting page content down.
*   **Reserve Ad Space**: Wrap ads in a container with a fixed minimum height.
*   **Specify Image Dimensions**: Always provide \`width\` and \`height\` properties to generate proper aspect-ratio boxes.

\`\`\`css
/* Pre-allocating space for dynamic ad slots to prevent CLS */
.ad-slot-container {
  min-height: 250px;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
\`\`\`

> "A stable layout is just as important as a fast load time. If the page content jumps when an ad loads, the user experience is broken."

### Key Takeaways
- Mark the main hero image with the \`priority={true}\` attribute.
- Pre-allocate container sizes for ads and dynamic widgets.
- Use Next.js dynamic fonts or system fallback font stacks.
- Minimize main-thread blocking by deferring non-essential scripts.

### Conclusion

By prioritizing your LCP banner and pre-allocating spaces for dynamic items, you can easily secure green Core Web Vitals scores. These updates ensure your Next.js application delivers a smooth experience while ranking higher in organic search results.

### Trending SEO Keywords
- Nextjs Core Web Vitals
- optimize Largest Contentful Paint
- prevent Cumulative Layout Shift
- Next.js image performance
- Lighthouse page speed optimization`,
    publishedAt: new Date().toISOString(),
    views: 0
  },
  {
    id: "react-server-components-vs-ssr-rendering-paradigm",
    title: "React Server Components vs. Traditional SSR: Choosing the Right Rendering Paradigm for Modern Web Applications",
    description: "An architectural comparison explaining the core differences between Server Side Rendering (SSR) and React Server Components (RSC) regarding bundle size and state preservation.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    author: "Deepanshu Bisht",
    language: "en",
    content: `### Introduction

In the React ecosystem, rendering strategies have evolved rapidly. For years, **Server-Side Rendering (SSR)** was the default choice for SEO-friendly websites. But with the introduction of **React Server Components (RSC)**, the boundary between client and server has shifted. Many developers confuse the two, assuming they are identical because both run on the server. However, they represent completely different architectural paradigms that solve different performance bottlenecks.

### Context

Choosing the wrong rendering approach can lead to bloated client-side JavaScript bundles and sluggish hydration times. Understanding where code executes is key to building fast web applications.

### Background Information

Traditional SSR renders the HTML structure on the server, but still sends the full JavaScript code to the client. The client must then run "hydration" to make the page interactive, which can block the browser main thread on lower-end devices.

### Analysis

Here's an analytical comparison of the two approaches:

| Feature | Traditional SSR | React Server Components (RSC) |
| :--- | :--- | :--- |
| **JS Bundle Cost** | Sends full JS bundle of components to client | Sends 0 client-side JS for server components |
| **Hydration** | Full page hydration required | No hydration needed for server-only files |
| **Data Fetching** | Happens at page level (getServerSideProps) | Can happen inside individual components |
| **Client State** | Preserved across transitions | Preserved while components stream in |

#### Code Comparison
In RSC, we fetch data directly inside our async components:
\`\`\`javascript
// React Server Component
export default async function ProductList() {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();
  
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
\`\`\`

> "SSR is about getting HTML to the screen quickly. RSC is about minimizing the amount of JavaScript sent to the client."

### Key Takeaways
- SSR sends HTML to the client but still requires full JS hydration.
- RSC removes server-only components from the final JavaScript bundle.
- Server Components can fetch data directly, simplifying the codebase.
- You can mix both by nesting Client Components inside Server Components.

### Conclusion

For content-heavy blogs, news sites, and e-commerce stores, React Server Components provide a massive reduction in bundle size. However, for highly interactive dashboards, traditional client-side rendering or selective SSR remains essential. Mixing both correctly is the key to modern web design.

### Trending SEO Keywords
- React Server Components vs SSR
- Nextjs rendering paradigms
- reduce JavaScript bundle size
- React hydration performance
- React Server Components data fetching`,
    publishedAt: new Date().toISOString(),
    views: 0
  },
  {
    id: "geopolitics-of-semiconductors-south-asian-industrial-policy",
    title: "Geopolitics of Semiconductors: How the Battle for Silicon Supremacy is Reshaping South Asian Industrial Policy",
    description: "An analytical editorial examining India's semiconductor mission, semiconductor manufacturing fabs, supply chain dynamics, and geopolitical competition.",
    category: "Politics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    author: "NewsAdda Editorial Board",
    language: "en",
    content: `### Introduction

Oil was the primary driver of 20th-century geopolitics. Today, that title belongs to silicon. Microchips are the lifeblood of modern technology, powering everything from smartphones to artificial intelligence supercomputers. As geopolitical tensions rise, nations are racing to secure their supply chains. In South Asia, this tech race has triggered a major shift in industrial policy, with India launching its ambitious Semiconductor Mission to establish silicon manufacturing fabs on domestic soil.

### Context

Currently, over 90% of advanced semiconductor manufacturing is concentrated in Taiwan. This concentration creates a huge single point of failure. In response, global powers are investing heavily in domestic manufacturing facilities.

### Background Information

India has historically excelled in chip design, housing design centers for global semiconductor giants. However, the country lacked actual fabrication plants (fabs) due to the massive capital requirements, specialized water supplies, and unstable electricity grids. The COVID-19 chip shortage highlighted these vulnerabilities, prompting government action.

### Analysis

Establishing a semiconductor ecosystem in South Asia faces several challenges:
1. **Capital Infrastructure**: A modern fab costs between $5 billion and $15 billion, requiring heavy government subsidies and private partnerships.
2. **Resource Consistency**: Fabs require millions of gallons of ultra-pure water and an uninterrupted power supply. A power fluctuation of even a microsecond can ruin a whole batch of silicon wafers.
3. **Talent Relocation**: While chip design talent is abundant, experienced fabrication engineers must be relocated to help train the local workforce.

> "A semiconductor fab is not just a factory; it is a high-tech ecosystem that requires decades of consistent policy support to thrive."

### Key Takeaways
- Silicon supply chains are highly concentrated, representing a global vulnerability.
- India's semiconductor policy focuses on bridging the gap between chip design and fabrication.
- Joint ventures with global chipmakers are essential for technology transfer.
- Resource consistency remains the primary operational challenge.

### Conclusion

The race for silicon supremacy is a long-term strategic game. India's investments in chip manufacturing are crucial steps toward securing technological independence. The success of this policy will determine whether South Asia becomes a key player in the global technology ecosystem.

### Trending SEO Keywords
- India semiconductor mission
- silicon supply chain geopolitics
- chip manufacturing fabs India
- semiconductor industrial policy
- global microchip shortage`,
    publishedAt: new Date().toISOString(),
    views: 0
  }
];

// Helper to estimate read time dynamically
function calculateReadTime(text) {
  const wordCount = text.split(/\s+/).length;
  return `${Math.max(3, Math.ceil(wordCount / 200))} min read`;
}

async function run() {
  // 3. Load existing database
  if (!fs.existsSync(dbPath)) {
    console.error("[Original Articles] Error: database.json not found!");
    process.exit(1);
  }
  let posts = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  console.log(`[Original Articles] Loaded ${posts.length} posts from database.json`);

  let addedCount = 0;

  // 4. Check and insert articles at the front of the database
  for (const article of originalArticles) {
    if (posts.some(p => p.id === article.id)) {
      console.log(`[Original Articles] Article with ID "${article.id}" already exists. Skipping.`);
    } else {
      // Complete read time estimation dynamically
      article.readTime = calculateReadTime(article.content);
      
      posts = [article, ...posts];
      addedCount++;
      console.log(`[Original Articles] [SUCCESS] Queued: "${article.title}"`);
    }
  }

  // 5. Save database.json and upload to Cloud Firestore
  if (addedCount > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log(`[Original Articles] Saved ${addedCount} articles locally to database.json.`);

    if (firestoreProjectId && firestoreApiKey) {
      try {
        console.log("[Original Articles] Syncing to Cloud Firestore...");
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firestoreProjectId}/databases/(default)/documents/data/database?key=${firestoreApiKey}&updateMask.fieldPaths=postsJson`;

        const payload = {
          fields: {
            postsJson: {
              stringValue: JSON.stringify(posts)
            }
          }
        };

        const res = await fetch(firestoreUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          console.log("[Original Articles] [SUCCESS] Synced database to Cloud Firestore.");
        } else {
          const errText = await res.text();
          console.error(`[Original Articles] Cloud Firestore update failed (Status: ${res.status}):`, errText);
        }
      } catch (err) {
        console.error("[Original Articles] Error calling Cloud Firestore:", err.message);
      }
    } else {
      console.log("[Original Articles] Firestore variables not fully configured in env. Local only.");
    }
  } else {
    console.log("[Original Articles] All original articles already present in database.");
  }
}

run();
