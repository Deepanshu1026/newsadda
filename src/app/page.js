import HomeFeed from "../../components/HomeFeed";
import { readDatabase } from "../../services/db";

// Revalidate every 60 seconds (ISR) for fresh SEO payloads without dynamic-render overhead
export const revalidate = 60;

export default async function HomePage() {
  const posts = await readDatabase();

  return <HomeFeed initialPosts={posts} />;
}
