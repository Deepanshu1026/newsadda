import fs from "fs/promises";
import path from "path";

// Keep an in-memory cache of posts to speed up reads and maintain container-level consistency
let postsCache = null;

const localDbPath = path.join(process.cwd(), "database.json");
const tmpDbPath = path.join("/tmp", "database.json");

/**
 * Reads the blog posts database.
 * First checks /tmp/database.json for runtime updates, then falls back to local database.json.
 */
export async function readDatabase() {
  if (postsCache) {
    return postsCache;
  }

  // 1. Try reading from the serverless writable temp directory
  try {
    const fileData = await fs.readFile(tmpDbPath, "utf-8");
    postsCache = JSON.parse(fileData);
    console.log("[DB Service] Successfully loaded database from /tmp/database.json");
    return postsCache;
  } catch (error) {
    // /tmp file doesn't exist or is invalid, fall through to reading the local bundle file
  }

  // 2. Read from local read-only project bundle (works on Vercel and local dev)
  try {
    const fileData = await fs.readFile(localDbPath, "utf-8");
    postsCache = JSON.parse(fileData);
    console.log("[DB Service] Successfully loaded bundled database.json");
    return postsCache;
  } catch (error) {
    console.error("[DB Service] Critical error: database.json not found in workspace, returning empty array:", error.message);
    return [];
  }
}

/**
 * Writes the blog posts database.
 * Writes to /tmp/database.json on serverless environments to bypass EROFS.
 * Also writes to local database.json in local dev environments.
 */
export async function writeDatabase(posts) {
  postsCache = posts;

  // 1. Write to /tmp/database.json (always writable in Vercel Serverless Functions)
  try {
    await fs.writeFile(tmpDbPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log("[DB Service] Successfully wrote database to /tmp/database.json");
  } catch (error) {
    console.error("[DB Service] Error writing to /tmp/database.json:", error.message);
  }

  // 2. Attempt to write to local database.json (works in local dev, fails gracefully on Vercel without throwing)
  try {
    await fs.writeFile(localDbPath, JSON.stringify(posts, null, 2), "utf-8");
    console.log("[DB Service] Successfully wrote database to local workspace database.json");
  } catch (error) {
    // Suppress EROFS error on Vercel since we successfully wrote to /tmp/
    console.log("[DB Service] Local workspace write skipped (Expected behavior on read-only Vercel environment)");
  }
}
