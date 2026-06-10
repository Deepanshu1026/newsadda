const fs = require("fs");
const path = require("path");

const dbPath = "c:\\Users\\chair\\OneDrive\\Desktop\\newsadda\\database.json";
const envPath = "c:\\Users\\chair\\OneDrive\\Desktop\\newsadda\\.env";

// 1. Load environment variables
console.log("[Improver] Loading environment variables from .env...");
if (!fs.existsSync(envPath)) {
  console.error("[Improver] Error: .env file not found!");
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

const apiKey = env.SARVAM_API_KEY;
const modelName = env.SARVAM_MODEL || "sarvam-105b";
const firestoreProjectId = env.FIRESTORE_PROJECT_ID || "auth-5ccab";
const firestoreApiKey = env.FIRESTORE_API_KEY || "AIzaSyAU7ldBTC2wAS6zdp8K7LkUnk0ghEsHePs";

if (!apiKey) {
  console.error("[Improver] Error: SARVAM_API_KEY is not defined in .env!");
  process.exit(1);
}

console.log(`[Improver] Configured model: ${modelName}`);

// 2. Load database
if (!fs.existsSync(dbPath)) {
  console.error("[Improver] Error: database.json not found!");
  process.exit(1);
}
const posts = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
console.log(`[Improver] Loaded ${posts.length} posts from database.json`);

// 3. Select top 30 articles by views, then content length
// We want to keep track of their original indices in the array so we can replace them in place.
const postsWithIndex = posts.map((post, index) => ({ post, index }));
postsWithIndex.sort((a, b) => {
  const viewsDiff = (b.post.views || 0) - (a.post.views || 0);
  if (viewsDiff !== 0) return viewsDiff;
  const lenA = a.post.content ? a.post.content.length : 0;
  const lenB = b.post.content ? b.post.content.length : 0;
  return lenB - lenA; // longer content first if views are equal
});

const targetCount = 30;
const selectedBatch = postsWithIndex.slice(0, targetCount);
console.log(`[Improver] Selected top ${selectedBatch.length} articles to improve.`);

// Helper to delay execution to respect rate limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function improvePost(item, currentNum, totalNum) {
  const { post, index } = item;
  console.log(`\n[Improver] [Progress: ${currentNum}/${totalNum}] Improving article [Original Index: ${index}]: "${post.title}"`);
  console.log(`           Category: ${post.category} | Current views: ${post.views}`);

  const prompt = `
You are a senior Indian sports and news editor at NewsAdda.
Your job is to rewrite the article below to drastically improve its quality, depth, and analytical rigor.

Headline Title: ${post.title}
Short Summary: ${post.description}
Category: ${post.category}

Original Content:
${post.content || ""}

CRITICAL REWRITE INSTRUCTIONS:
1. Rewrite the entire article into a highly engaging, professional news report. Do NOT just summarize the original. Rather, expand and structuralize the original information.
2. Instead of simple statements (e.g. "India won the match by 5 wickets."), add deep analysis: why the event/match mattered, key player performances, tournament impact, expert observations, and what happens next.
3. The rewritten content MUST strictly follow this exact Markdown structure:

### Introduction
[A strong, gripping editorial hook that goes beyond basic facts to set the tone, stakes, and narrative for the article.]

### Context
[A detailed explanation of the event context, timeline, participants, and immediate settings.]

### Background Information
[Provide historical context, preceding events, team or person history, and prior trends that led up to this point.]

### Analysis
[A deep analytical breakdown of the event, discussing key player performances, strategy execution, expert quotes/opinions, and tactical elements or broader implications.]

### Key Takeaways
- [High-impact takeaway 1]
- [High-impact takeaway 2]
- [High-impact takeaway 3]
- [High-impact takeaway 4]

### Conclusion
[What happens next, future prospects, tournament/industry impact, next matches, or subsequent developments.]

### Trending SEO Keywords
- [Natural SEO Tag 1]
- [Natural SEO Tag 2]
- [Natural SEO Tag 3]
- [Natural SEO Tag 4]
- [Natural SEO Tag 5]

RULES:
1. Do NOT include the main title or the category as a header at the top of the output. Start directly with the "### Introduction" section.
2. The entire article should be between 450 and 700 words. It must be written fully and conclude cleanly.
3. Write in an authoritative, analytical, and gripping tone. Use active voice, clear headings, bold text, and bullet points.
`;

  try {
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        reasoning_effort: "low",
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.warn(`[Improver] API returned error status ${response.status} for "${post.title}". Skipping.`);
      return false;
    }

    const data = await response.json();
    const newContent = data.choices?.[0]?.message?.content;

    if (newContent && newContent.includes("### Introduction") && newContent.includes("### Conclusion")) {
      posts[index].content = newContent;
      // Recalculate read time
      posts[index].readTime = `${Math.max(3, Math.ceil(newContent.split(/\s+/).length / 200))} min read`;
      posts[index].updatedAt = new Date().toISOString();
      console.log(`[Improver] [Success] Improved article. New length: ${newContent.length} chars, read time: ${posts[index].readTime}`);
      return true;
    } else {
      console.warn(`[Improver] [Warning] Generated content was missing key headings for "${post.title}". Skipping. Content excerpt:`, newContent ? newContent.substring(0, 150) : "empty");
      return false;
    }
  } catch (err) {
    console.error(`[Improver] Error calling Sarvam API for "${post.title}":`, err.message);
    return false;
  }
}

async function run() {
  let successCount = 0;

  console.log(`[Improver] Processing ${selectedBatch.length} articles...`);

  for (let i = 0; i < selectedBatch.length; i++) {
    const item = selectedBatch[i];
    const success = await improvePost(item, i + 1, selectedBatch.length);
    if (success) {
      successCount++;
    }
    await sleep(2000); // 2-second rate-limiting delay
  }

  if (successCount > 0) {
    console.log(`\n[Improver] Saving updated database to local database.json...`);
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log(`[Improver] Local database.json updated successfully.`);

    // 4. Update Cloud Firestore database document if configured
    if (firestoreProjectId && firestoreApiKey) {
      try {
        console.log("[Improver] Writing updated database to Cloud Firestore...");
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
          console.log("[Improver] Successfully saved database to Cloud Firestore.");
        } else {
          const errText = await res.text();
          console.warn(`[Improver] Cloud Firestore write failed with status ${res.status}:`, errText);
        }
      } catch (error) {
        console.error("[Improver] Error writing to Cloud Firestore:", error.message);
      }
    }
  }

  console.log(`\n[Improver] Done! Improved ${successCount}/${selectedBatch.length} articles successfully.`);
}

run();
