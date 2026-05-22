import fs from "fs/promises";
import path from "path";
import { cache } from "react";

const localDbPath = path.join(process.cwd(), "database.json");
const tmpDbPath = path.join("/tmp", "database.json");

// Retrieve Vercel KV environment variables (injected automatically when connected to a Vercel KV store)
const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;

// Retrieve Firebase Realtime Database environment variable
const firebaseDbUrl = process.env.FIREBASE_DATABASE_URL;

const getFirebaseUrl = () => {
  if (!firebaseDbUrl) return null;
  const baseUrl = firebaseDbUrl.endsWith("/") ? firebaseDbUrl.slice(0, -1) : firebaseDbUrl;
  return `${baseUrl}/posts.json`;
};

/**
 * Reads the blog posts database from its source.
 * If Vercel KV is connected, it retrieves the posts from the cloud store.
 * Otherwise, it falls back to /tmp/database.json, then to the local database.json file.
 */
async function fetchDatabaseRaw() {
  // 1. Try reading from Firebase Realtime Database if configured
  const firebaseResUrl = getFirebaseUrl();
  if (firebaseResUrl) {
    try {
      console.log("[DB Service] Firebase DB detected. Fetching database from Firebase...");
      const res = await fetch(firebaseResUrl, { cache: "no-store" });
      if (res.ok) {
        const posts = await res.json();
        if (posts && Array.isArray(posts)) {
          console.log(`[DB Service] Loaded ${posts.length} posts successfully from Firebase.`);
          return posts;
        } else if (posts === null) {
          console.log("[DB Service] Firebase DB is empty. Initializing with bundled database.json...");
          const bundledPosts = await readBundledDatabase();
          if (bundledPosts.length > 0) {
            await writeDatabase(bundledPosts);
          }
          return bundledPosts;
        }
      } else {
        console.warn("[DB Service] Firebase DB returned error status:", res.status);
      }
    } catch (error) {
      console.error("[DB Service] Error reading from Firebase DB, falling back:", error.message);
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
  // 1. Write to Firebase Realtime Database if configured
  const firebaseResUrl = getFirebaseUrl();
  if (firebaseResUrl) {
    try {
      console.log("[DB Service] Writing updated database to Firebase Realtime Database...");
      const res = await fetch(firebaseResUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(posts),
      });

      if (res.ok) {
        console.log("[DB Service] Successfully saved database to Firebase Realtime Database.");
      } else {
        console.warn("[DB Service] Firebase Realtime Database write failed with status:", res.status);
      }
    } catch (error) {
      console.error("[DB Service] Error writing to Firebase Realtime Database:", error.message);
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
