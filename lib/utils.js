/**
 * Language-aware post URL builder.
 * Routes Hindi posts to /hi/posts/:id and Hinglish posts to /hinglish/posts/:id for proper multilingual SEO.
 */
export function getPostUrl(post) {
  if (post?.language === "hi") {
    return `/hi/posts/${post.id}`;
  }
  if (post?.language === "hinglish") {
    return `/hinglish/posts/${post.id}`;
  }
  return `/posts/${post.id}`;
}
