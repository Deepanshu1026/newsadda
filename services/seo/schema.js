import { SEO_CONFIG, getCanonicalUrl } from "./config";

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
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SEO_CONFIG.publisher.address.street,
      "addressLocality": SEO_CONFIG.publisher.address.city,
      "addressRegion": SEO_CONFIG.publisher.address.state,
      "postalCode": SEO_CONFIG.publisher.address.postalCode,
      "addressCountry": SEO_CONFIG.publisher.address.country
    },
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
  const slug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SEO_CONFIG.baseUrl}/author/${slug}/#person`,
    "name": authorName,
    "jobTitle": "Senior Journalist",
    "worksFor": {
      "@type": "Organization",
      "name": SEO_CONFIG.siteName
    },
    "description": bio || `${authorName} is an experienced writer and political commentator covering major affairs in South Asia for NewsAdda.`,
    "url": getCanonicalUrl(`/author/${slug}`),
    "sameAs": sameAs.length > 0 ? sameAs : [
      `https://twitter.com/${slug}`,
      `https://linkedin.com/in/${slug}`
    ]
  };
}

/**
 * Generates a NewsArticle Schema
 * @param {Object} post - Dynamic article object
 */
export function getNewsArticleSchema(post) {
  const articleUrl = getCanonicalUrl(`/posts/${post.id}`);
  const authorSlug = (post.author || SEO_CONFIG.defaultAuthor).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const authorProfileUrl = getCanonicalUrl(`/author/${authorSlug}`);

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
      "name": post.author || SEO_CONFIG.defaultAuthor,
      "jobTitle": "Journalist",
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
