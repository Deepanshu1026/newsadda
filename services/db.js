import fs from "fs/promises";
import path from "path";
import { cache } from "react";

const localDbPath = path.join(process.cwd(), "database.json");
const tmpDbPath = path.join("/tmp", "database.json");

// Retrieve Vercel KV environment variables (injected automatically when connected to a Vercel KV store)
const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;


// Retrieve Firestore environment variables
const firestoreProjectId = process.env.FIRESTORE_PROJECT_ID || "auth-5ccab";
const firestoreApiKey = process.env.FIRESTORE_API_KEY || "AIzaSyAU7ldBTC2wAS6zdp8K7LkUnk0ghEsHePs";

const getFirestoreUrl = () => {
  if (!firestoreProjectId || !firestoreApiKey) return null;
  return `https://firestore.googleapis.com/v1/projects/${firestoreProjectId}/databases/(default)/documents/data/database?key=${firestoreApiKey}`;
};

/**
 * Reads the blog posts database from its source.
 * If Cloud Firestore is connected, it retrieves posts from there.
 * If Vercel KV is connected, it retrieves the posts from the cloud store.
 * Otherwise, it falls back to /tmp/database.json, then to the local database.json file.
 */
async function fetchDatabaseRaw() {
  // 1. Try reading from Cloud Firestore if configured
  const firestoreResUrl = getFirestoreUrl();
  if (firestoreResUrl) {
    try {
      console.log("[DB Service] Cloud Firestore detected. Fetching database from Firestore...");
      const res = await fetch(firestoreResUrl, { cache: "no-store" });
      if (res.ok) {
        const doc = await res.json();
        if (doc && doc.fields && doc.fields.postsJson && doc.fields.postsJson.stringValue) {
          const posts = JSON.parse(doc.fields.postsJson.stringValue);
          console.log(`[DB Service] Loaded ${posts.length} posts successfully from Cloud Firestore.`);
          return posts;
        }
      } else if (res.status === 404) {
        console.log("[DB Service] Cloud Firestore document not found. Initializing with bundled database.json...");
        const bundledPosts = await readBundledDatabase();
        if (bundledPosts.length > 0) {
          await writeDatabase(bundledPosts);
        }
        return bundledPosts;
      } else {
        console.warn("[DB Service] Cloud Firestore returned error status:", res.status);
      }
    } catch (error) {
      console.error("[DB Service] Error reading from Cloud Firestore, falling back:", error.message);
    }
  }

  // 1. Try reading from Vercel KV if connected
  if (kvUrl && kvToken) {
    try {
      console.log("[DB Service] Vercel KV detected. Fetching database from cloud store...");
      const res = await fetch(`${kvUrl}/get/posts`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        // Upstash REST API returns { result: "stringified_data" }
        if (data && data.result) {
          const posts = JSON.parse(data.result);
          console.log(`[DB Service] Loaded ${posts.length} posts successfully from Vercel KV.`);
          return posts;
        } else {
          console.log("[DB Service] Vercel KV store is empty. Initializing with bundled database.json...");
          const bundledPosts = await readBundledDatabase();
          if (bundledPosts.length > 0) {
            await writeDatabase(bundledPosts);
          }
          return bundledPosts;
        }
      } else {
        console.warn("[DB Service] Vercel KV returned error status:", res.status);
      }
    } catch (error) {
      console.error("[DB Service] Error reading from Vercel KV, falling back:", error.message);
    }
  }

  // 2. Try reading from the serverless writable temp directory fallback (Vercel production only)
  if (process.env.VERCEL) {
    try {
      const fileData = await fs.readFile(tmpDbPath, "utf-8");
      const posts = JSON.parse(fileData);
      console.log("[DB Service] Loaded database from local /tmp/database.json");
      return posts;
    } catch (error) {
      // /tmp file doesn't exist or is invalid, fall through
    }
  }

  // 3. Fall back to reading the local bundle file
  return readBundledDatabase();
}

/**
 * Internal helper to read the bundled database.json file.
 */
async function readBundledDatabase() {
  try {
    const fileData = await fs.readFile(localDbPath, "utf-8");
    const posts = JSON.parse(fileData);
    console.log("[DB Service] Loaded database from bundled database.json");
    return posts;
  } catch (error) {
    console.error("[DB Service] Bundled database.json not found in workspace, returning empty array:", error.message);
    return [];
  }
}

// Request-scoped memoized database read for optimized rendering across a single render request
export const readDatabase = cache(fetchDatabaseRaw);

/**
 * Writes the blog posts database.
 * If Vercel KV is connected, it writes directly to the cloud store.
 * Otherwise, it writes to /tmp/database.json and the local database.json file.
 */
export async function writeDatabase(posts) {
  // 1. Write to Cloud Firestore if configured
  const firestoreResUrl = getFirestoreUrl();
  if (firestoreResUrl) {
    try {
      console.log("[DB Service] Writing updated database to Cloud Firestore...");
      const payload = {
        fields: {
          postsJson: {
            stringValue: JSON.stringify(posts)
          }
        }
      };
      const res = await fetch(firestoreResUrl + "&updateMask.fieldPaths=postsJson", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("[DB Service] Successfully saved database to Cloud Firestore.");
      } else {
        console.warn("[DB Service] Cloud Firestore write failed with status:", res.status);
      }
    } catch (error) {
      console.error("[DB Service] Error writing to Cloud Firestore:", error.message);
    }
  }


  // 2. Write to Vercel KV if connected
  if (kvUrl && kvToken) {
    try {
      console.log("[DB Service] Writing updated database to Vercel KV cloud store...");
      const res = await fetch(`${kvUrl}/set/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kvToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(posts),
      });

      if (res.ok) {
        console.log("[DB Service] Successfully saved database to Vercel KV.");
      } else {
        console.warn("[DB Service] Vercel KV write failed with status:", res.status);
      }
    } catch (error) {
      console.error("[DB Service] Error writing to Vercel KV:", error.message);
    }
  }

  // 3. Write to /tmp/database.json for local/container consistency (Vercel production only)
  if (process.env.VERCEL) {
    try {
      await fs.writeFile(tmpDbPath, JSON.stringify(posts, null, 2), "utf-8");
      console.log("[DB Service] Wrote database to /tmp/database.json");
    } catch (error) {
      console.error("[DB Service] Error writing to /tmp/database.json:", error.message);
    }
  }

  // 4. Attempt to write to local database.json (works in local dev, fails gracefully on Vercel without throwing)
  try {
    await fs.writeFile(localDbPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log("[DB Service] Wrote database to local workspace database.json");
  } catch (error) {
    // Suppress EROFS error on Vercel
    console.log("[DB Service] Local workspace write skipped (Read-only Vercel environment)");
  }
}
