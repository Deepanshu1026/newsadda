import HomeFeed from "../../components/HomeFeed";
import { readDatabase } from "../../services/db";

// Force server pre-rendering on every page visit to ensure SEO payloads are perfectly updated
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await readDatabase();

  return <HomeFeed initialPosts={posts} />;
}
