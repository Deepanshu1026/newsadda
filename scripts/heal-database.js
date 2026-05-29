const fs = require("fs");
const path = require("path");

const dbPath = "c:\\Users\\chair\\OneDrive\\Desktop\\newsadda\\database.json";
const envPath = "c:\\Users\\chair\\OneDrive\\Desktop\\newsadda\\.env";

// 1. Load environment variables
console.log("[Healer] Loading environment variables from .env...");
if (!fs.existsSync(envPath)) {
  console.error("[Healer] Error: .env file not found!");
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
  console.error("[Healer] Error: SARVAM_API_KEY is not defined in .env!");
  process.exit(1);
}

console.log(`[Healer] Configured model: ${modelName}`);

// 2. Load database
if (!fs.existsSync(dbPath)) {
  console.error("[Healer] Error: database.json not found!");
  process.exit(1);
}
const posts = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
console.log(`[Healer] Loaded ${posts.length} posts from database.json`);

// 3. Detect truncated articles
const truncatedIndices = [];
posts.forEach((post, index) => {
  const content = post.content || "";
  const hasKeywords = content.includes("Trending SEO Keywords");
  const endsAbruptly = !content.trim().match(/[.!?*`"]$/) || content.trim().endsWith("The **Supreme Court of") || content.trim().endsWith("Their") || content.trim().endsWith("This") || content.trim().endsWith("personal") || content.trim().endsWith("to");

  if (!hasKeywords || endsAbruptly) {
    truncatedIndices.push(index);
  }
});

console.log(`[Healer] Identified ${truncatedIndices.length} truncated/incomplete articles to repair.`);

// Helper to delay execution to respect rate limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function healPost(index) {
  const post = posts[index];
  console.log(`\n[Healer] [Progress: ${index + 1}/${posts.length}] Repairing article: "${post.title}"`);
  console.log(`         Category: ${post.category}`);

  const prompt = `
You are an expert Indian journalist and SEO specialist writing for NewsAdda.
Write a highly engaging, concise, and SEO-optimized news blog article based on the following details:

Category: ${post.category}
Headline Title: ${post.title}
Short Summary: ${post.description}

CRITICAL INSTRUCTIONS FOR COMPLETENESS & SEO:
1. The article MUST be a concise but high-impact read of exactly 350 to 450 words in total. It is CRITICAL that you complete the entire article and do not get cut off. Ensure the article is fully written, concluded, and polished.
2. Format the entire article in clean, professional Markdown.
3. Use descriptive subheadings (###) to separate sections (e.g., Match Preview/Background, Core Dynamics, and Strategic Outlook/Implications).
4. Use bold text, bullet points (1., *), and a high-quality blockquote (> ) to make the post highly readable and engaging.
5. Identify 4-6 highly relevant, trending SEO keywords based on the headline and search context. Integrate these keywords naturally with high density throughout the text to boost trending rank.
6. Add a list of "Trending SEO Keywords" in a clean bulleted list at the very bottom of the post.
7. Do NOT include the main title or the category as a header in your output. Start directly with the introduction.
8. Write in an authoritative, analytical, and gripping tone tailored for Indian and global readers.
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
        max_tokens: 2500,
        reasoning_effort: "low",
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.warn(`[Healer] API returned error status ${response.status} for "${post.title}". Skipping.`);
      return false;
    }

    const data = await response.json();
    const newContent = data.choices?.[0]?.message?.content;

    if (newContent && newContent.includes("Trending SEO Keywords")) {
      post.content = newContent;
      // Recalculate read time
      post.readTime = `${Math.max(3, Math.ceil(newContent.split(/\s+/).length / 200))} min read`;
      console.log(`[Healer] [Success] Repaired article. New length: ${newContent.length} chars, read time: ${post.readTime}`);
      return true;
    } else {
      console.warn(`[Healer] [Warning] Generated content was still truncated or missing keywords for "${post.title}". Skipping.`);
      return false;
    }
  } catch (err) {
    console.error(`[Healer] Error calling Sarvam API for "${post.title}":`, err.message);
    return false;
  }
}

async function run() {
  let successCount = 0;

  // For safety and to prevent hitting strict rate limits, we will process up to 20 articles per run.
  // The user can run it multiple times if needed, or we can increase it if the first batch succeeds beautifully.
  const batchLimit = 20;
  const toProcess = truncatedIndices.slice(0, batchLimit);

  console.log(`[Healer] Processing a batch of ${toProcess.length} articles...`);

  for (let i = 0; i < toProcess.length; i++) {
    const index = toProcess[i];
    const success = await healPost(index);
    if (success) successCount++;
    await sleep(2000); // 2-second rate-limiting delay
  }

  if (successCount > 0) {
    console.log(`\n[Healer] Saving updated database to local database.json...`);
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log(`[Healer] Local database.json updated successfully.`);

    // 4. Update Cloud Firestore database document if configured
    if (firestoreProjectId && firestoreApiKey) {
      try {
        console.log("[Healer] Writing updated database to Cloud Firestore...");
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
          console.log("[Healer] Successfully saved database to Cloud Firestore.");
        } else {
          const errText = await res.text();
          console.warn(`[Healer] Cloud Firestore write failed with status ${res.status}:`, errText);
        }
      } catch (error) {
        console.error("[Healer] Error writing to Cloud Firestore:", error.message);
      }
    }
  }

  console.log(`\n[Healer] Done! Repaired ${successCount}/${toProcess.length} articles successfully in this batch.`);
  console.log(`[Healer] Remaining truncated articles in database: ${truncatedIndices.length - successCount}`);
  if (truncatedIndices.length - successCount > 0) {
    console.log(`[Healer] Note: Run the script again to process the next batch of ${batchLimit} articles.`);
  }
}

run();
