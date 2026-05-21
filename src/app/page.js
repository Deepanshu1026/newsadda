import fs from "fs/promises";
import path from "path";
import HomeFeed from "../../components/HomeFeed";

// Force server pre-rendering on every page visit to ensure SEO payloads are perfectly updated
export const dynamic = "force-dynamic";

async function getPosts() {
  const dbPath = path.join(process.cwd(), "database.json");
  try {
    const fileData = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    console.error("[Home Page] Error reading database.json, returning empty list:", error.message);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="main-wrapper">
      <HomeFeed initialPosts={posts} />
    </div>
  );
}
