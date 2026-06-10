import { SEO_CONFIG, getCanonicalUrl } from "./config";
import { getAuthorProfile } from "../authorService";

/**
 * Generates an Organization Schema (JSON-LD)
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SEO_CONFIG.baseUrl}/#organization`,
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": SEO_CONFIG.publisher.logoUrl,
      "width": 180,
      "height": 60
    },
    "foundingDate": SEO_CONFIG.publisher.foundingDate,
    "publishingPrinciples": `${SEO_CONFIG.baseUrl}/editorial-policy`,
    "sameAs": [
      SEO_CONFIG.socials.facebook,
      SEO_CONFIG.socials.twitter,
      SEO_CONFIG.socials.linkedin,
      SEO_CONFIG.socials.youtube
    ],
    "diversityPolicy": `${SEO_CONFIG.baseUrl}/editorial-policy`,
    "ethicsPolicy": `${SEO_CONFIG.baseUrl}/editorial-policy`,
    "correctionsPolicy": `${SEO_CONFIG.baseUrl}/editorial-policy`
  };
}

/**
 * Generates a WebSite Schema with SearchAction
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SEO_CONFIG.baseUrl}/#website`,
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SEO_CONFIG.baseUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generates a BreadcrumbList Schema
 * @param {Array<{name: string, url: string}>} items - List of breadcrumb steps
 */
export function getBreadcrumbSchema(items = []) {
  const itemListElement = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": SEO_CONFIG.baseUrl
    },
    ...items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 2,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : getCanonicalUrl(item.url)
    }))
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement
  };
}

/**
 * Generates an Author Schema (Person)
 * @param {string} authorName - Author name
 * @param {string} [bio] - Optional biography
 * @param {Array<string>} [sameAs] - Social or verified credentials links
 */
export function getAuthorSchema(authorName, bio = "", sameAs = []) {
  const profile = getAuthorProfile(authorName);
  const socialSameAs = profile.socials ? Object.values(profile.socials).filter(Boolean) : [];
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SEO_CONFIG.baseUrl}/author/${profile.slug}/#person`,
    "name": profile.name,
    "jobTitle": profile.title,
    "worksFor": {
      "@type": "Organization",
      "name": SEO_CONFIG.siteName
    },
    "description": profile.shortBio || bio || `${profile.name} is an experienced writer and commentator covering major affairs for NewsAdda.`,
    "url": getCanonicalUrl(`/author/${profile.slug}`),
    "sameAs": socialSameAs.length > 0 ? socialSameAs : sameAs
  };
}

/**
 * Generates a NewsArticle Schema
 * @param {Object} post - Dynamic article object
 */
export function getNewsArticleSchema(post) {
  const articleUrl = getCanonicalUrl(`/posts/${post.id}`);
  const profile = getAuthorProfile(post.author || SEO_CONFIG.defaultAuthor);
  const authorProfileUrl = getCanonicalUrl(`/author/${profile.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl}/#article`,
    "isPartOf": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "headline": post.title,
    "description": post.description,
    "image": [
      post.image || SEO_CONFIG.publisher.logoUrl
    ],
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt, // Modified matches published for simplicity unless explicitly tracked
    "author": {
      "@type": "Person",
      "name": profile.name,
      "jobTitle": profile.title,
      "url": authorProfileUrl
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "@id": `${SEO_CONFIG.baseUrl}/#organization`,
      "name": SEO_CONFIG.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": SEO_CONFIG.publisher.logoUrl
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "xpath": [
        "/html/head/title",
        "/html/head/meta[@name='description']/@content"
      ]
    }
  };
}

/**
 * Generates an FAQPage Schema from raw text Q&A
 * @param {Array<{q: string, a: string}>} questions - List of QA blocks
 */
export function getFaqSchema(questions = []) {
  if (questions.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };
}
