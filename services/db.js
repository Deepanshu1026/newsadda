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

// Firestore enforces a hard 1 MB (1,048,576 byte) limit per document.
// We shard the posts array across multiple documents so the database can grow indefinitely.
const FIRESTORE_CHUNK_SIZE = 40;
const MANIFEST_DOC = "database_manifest";
const LEGACY_DOC = "database";

const getFirestoreDocUrl = (docName) => {
  if (!firestoreProjectId || !firestoreApiKey) return null;
  return `https://firestore.googleapis.com/v1/projects/${firestoreProjectId}/databases/(default)/documents/data/${docName}?key=${firestoreApiKey}`;
};

/**
 * Reads all posts from the sharded Cloud Firestore store.
 * Returns an array of posts, or null if the store has not been initialized yet.
 */
async function readFromFirestore() {
  // 1. Try the sharded manifest first
  const manifestUrl = getFirestoreDocUrl(MANIFEST_DOC);
  const manifestRes = await fetch(manifestUrl, { cache: "no-store" });

  if (manifestRes.ok) {
    const manifest = await manifestRes.json();
    const fields = manifest.fields || {};
    const chunkCount = parseInt(fields.chunkCount?.integerValue || "0", 10);

    if (chunkCount > 0) {
      const chunkUrls = [];
      for (let i = 0; i < chunkCount; i++) {
        chunkUrls.push(getFirestoreDocUrl(`database_chunk_${i}`));
      }

      const chunkResponses = await Promise.all(
        chunkUrls.map((url) => fetch(url, { cache: "no-store" }))
      );

      let posts = [];
      for (const res of chunkResponses) {
        if (!res.ok) continue;
        const doc = await res.json();
        const json = doc.fields?.postsJson?.stringValue;
        if (json) {
          posts = posts.concat(JSON.parse(json));
        }
      }

      console.log(`[DB Service] Loaded ${posts.length} posts from ${chunkCount} Firestore shard(s).`);
      return posts;
    }
  }

  // 2. Backward compatibility: legacy single-document store
  const legacyUrl = getFirestoreDocUrl(LEGACY_DOC);
  const legacyRes = await fetch(legacyUrl, { cache: "no-store" });

  if (legacyRes.ok) {
    const doc = await legacyRes.json();
    const json = doc.fields?.postsJson?.stringValue;
    if (json) {
      const posts = JSON.parse(json);
      console.log(`[DB Service] Loaded ${posts.length} posts from legacy Firestore document.`);
      return posts;
    }
    return [];
  }

  if (legacyRes.status === 404 && manifestRes.status === 404) {
    // Store not initialized yet
    return null;
  }

  // Some other unexpected state
  if (!legacyRes.ok && legacyRes.status !== 404) {
    throw new Error(`Firestore read error: manifest=${manifestRes.status}, legacy=${legacyRes.status}`);
  }

  return [];
}

/**
 * Writes posts to the sharded Cloud Firestore store.
 */
async function writeToFirestore(posts) {
  // 1. Split posts into chunks that each stay well under the 1 MB document limit
  const chunks = [];
  for (let i = 0; i < posts.length; i += FIRESTORE_CHUNK_SIZE) {
    chunks.push(posts.slice(i, i + FIRESTORE_CHUNK_SIZE));
  }

  // 2. Write every chunk in parallel
  const chunkWrites = chunks.map((chunk, i) => {
    const url = `${getFirestoreDocUrl(`database_chunk_${i}`)}&updateMask.fieldPaths=postsJson`;
    const payload = {
      fields: {
        postsJson: { stringValue: JSON.stringify(chunk) },
        chunkIndex: { integerValue: String(i) },
      },
    };
    return fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  });

  const chunkResults = await Promise.all(chunkWrites);
  const failedChunk = chunkResults.find((r) => !r.ok);
  if (failedChunk) {
    const errText = await failedChunk.text().catch(() => "");
    throw new Error(`Firestore chunk write failed (${failedChunk.status}): ${errText}`);
  }

  // 3. Write the manifest last so readers only see a complete dataset
  const manifestUrl = `${getFirestoreDocUrl(MANIFEST_DOC)}&updateMask.fieldPaths=chunkCount&updateMask.fieldPaths=totalPosts&updateMask.fieldPaths=updatedAt`;
  const manifestPayload = {
    fields: {
      chunkCount: { integerValue: String(chunks.length) },
      totalPosts: { integerValue: String(posts.length) },
      updatedAt: { stringValue: new Date().toISOString() },
    },
  };

  const manifestRes = await fetch(manifestUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(manifestPayload),
  });

  if (!manifestRes.ok) {
    const errText = await manifestRes.text().catch(() => "");
    throw new Error(`Firestore manifest write failed (${manifestRes.status}): ${errText}`);
  }

  console.log(`[DB Service] Saved ${posts.length} posts across ${chunks.length} Firestore shard(s).`);
}

/**
 * Reads the blog posts database from its source.
 * If Cloud Firestore is connected, it retrieves posts from there.
 * If Vercel KV is connected, it retrieves the posts from the cloud store.
 * Otherwise, it falls back to /tmp/database.json, then to the local database.json file.
 */
async function fetchDatabaseRaw() {
  // 1. Try reading from Cloud Firestore if configured
  if (firestoreProjectId && firestoreApiKey) {
    try {
      console.log("[DB Service] Cloud Firestore detected. Fetching database from Firestore...");
      const posts = await readFromFirestore();
      if (posts !== null) {
        return posts;
      }
      // Not initialized yet: seed from bundled database.json
      console.log("[DB Service] Cloud Firestore store not initialized. Seeding with bundled database.json...");
      const bundledPosts = await readBundledDatabase();
      if (bundledPosts.length > 0) {
        await writeDatabase(bundledPosts);
      }
      return bundledPosts;
    } catch (error) {
      console.error("[DB Service] Error reading from Cloud Firestore, falling back:", error.message);
    }
  }

  // 2. Try reading from Vercel KV if connected
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

  // 3. Try reading from the serverless writable temp directory fallback (Vercel production only)
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

  // 4. Fall back to reading the local bundle file
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
 * If Cloud Firestore is connected, it writes sharded chunks to the cloud store.
 * If Vercel KV is connected, it writes directly to the cloud store.
 * Otherwise, it writes to /tmp/database.json and the local database.json file.
 */
export async function writeDatabase(posts) {
  // 1. Write to Cloud Firestore if configured
  if (firestoreProjectId && firestoreApiKey) {
    try {
      console.log("[DB Service] Writing updated database to Cloud Firestore (sharded)...");
      await writeToFirestore(posts);
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
