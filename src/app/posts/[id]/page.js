import { notFound, redirect } from "next/navigation";
import { readDatabase } from "../../../../services/db";
import { SEO_CONFIG, getCanonicalUrl } from "../../../../services/seo/config";
import { getPostKeywordString } from "../../../../services/seo/keywords";
import { getTrendSlugs } from "../../../../services/trends/trendFetcher";
import ArticlePageContent from "../../../../components/ArticlePageContent";

export const revalidate = 60;

async function getPostById(id) {
  try {
    const posts = await readDatabase();
    return posts.find((p) => p.id === id);
  } catch (error) {
    console.error(`[Article Page] Error reading post ID ${id}:`, error.message);
    return null;
  }
}

// Generate Dynamic SEO Metadata for Google Discover, Google News, and indexation
export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return {
      title: "Article Not Found | NewsAdda",
      description: "The requested news blog article could not be located.",
    };
  }

  const authorSlug = (post.author || SEO_CONFIG.defaultAuthor).toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    title: `${post.title} | ${SEO_CONFIG.siteName}`,
    description: post.description,
    keywords: getPostKeywordString(post),
    alternates: {
      canonical: getCanonicalUrl(`/posts/${post.id}`),
      languages: {
        "en-US": getCanonicalUrl(`/posts/${post.id}`),
        "hi-IN": getCanonicalUrl(`/hi/posts/${post.id}`),
      }
    },
    other: {
      robots: "max-image-preview:large, index, follow"
    },
    openGraph: {
      title: `${post.title} | ${SEO_CONFIG.siteName}`,
      description: post.description,
      url: getCanonicalUrl(`/posts/${post.id}`),
      images: [
        {
          url: post.image || SEO_CONFIG.publisher.logoUrl,
          alt: post.title,
        },
      ],
      type: "article",
      locale: "en_US",
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: [getCanonicalUrl(`/author/${authorSlug}`)]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image || SEO_CONFIG.publisher.logoUrl],
      creator: SEO_CONFIG.socials.twitter
    },
  };
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  // Redirect Hindi and Hinglish articles to their canonical language-specific URLs
  if (post.language === "hi") {
    redirect(`/hi/posts/${id}`);
  }
  if (post.language === "hinglish") {
    redirect(`/hinglish/posts/${id}`);
  }

  // Load all posts to compile related and trending lists
  const allPosts = await readDatabase();

  const relatedPosts = allPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const trendingPosts = allPosts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  return (
    <ArticlePageContent
      post={post}
      relatedPosts={relatedPosts}
      trendingPosts={trendingPosts}
      allPosts={allPosts}
      trendSlugs={getTrendSlugs()}
      lang="en"
    />
  );
}
