import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateBlogArticle(title, description, category = "Technology") {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("[Gemini Service] GEMINI_API_KEY is missing. Generating human-sounding fallback Markdown article.");
    return generateFallbackMarkdown(title, description, category);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a seasoned Indian tech reporter writing for NewsAdda. Your readers are smart but busy — they want depth without dryness. Write like you're talking to a friend who cares about tech but hates jargon.

Category: ${category}
Headline Title: ${title}
Short Summary: ${description}

CRITICAL INSTRUCTIONS:
1. Format in clean Markdown. Use ### subheadings that sound like a real blog, not a research paper.
2. Use bold, bullet points, ONE blockquote. Make it readable.
3. If code makes sense, add a short code block (\`\`\`javascript ... \`\`\`).
4. Do NOT start with the title as a header. Jump into the story.
5. Write at least 3-4 solid paragraphs, ideally more.
6. HUMAN TONE (break these and it sounds like a bot):
   - Use contractions: don't, can't, it's, won't, that's.
   - Mix short and long sentences. Start some paragraphs casually.
   - Avoid AI poison words: "delve", "landscape", "tapestry", "robust", "multifaceted", "in today's fast-paced world", "cascade", "pivotal", "paramount", "foster", "leverage", "synergy", "holistic".
   - Add human touches: "Here's what surprised me...", "Not everyone's convinced, and honestly? Fair.", "If you're thinking [X], you're not alone."
   - Explain complex stuff with real-world analogies.
   - Vary sentence openings.
   - Use specific numbers and examples.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text || generateFallbackMarkdown(title, description, category);
  } catch (error) {
    console.error("[Gemini Service] Error calling Gemini AI API:", error.message);
    return generateFallbackMarkdown(title, description, category);
  }
}

function generateFallbackMarkdown(title, description, category) {
  const cleanTitle = title.replace(/[^\w\s]/gi, '');
  const keywords = cleanTitle.split(" ").filter(w => w.length > 4);
  const keyword1 = keywords[0] || "tech";
  const keyword2 = keywords[1] || "update";
  const keyword3 = keywords[2] || "news";

  const intros = [
    `If you've been keeping an eye on ${category.toLowerCase()} lately, **${title}** probably caught your attention. And if it didn't, maybe it should have.`,
    `**${title}** — on paper it sounds like routine news. But once you look closer, there's a genuine shift happening here.`,
    `Here's something that quietly slipped into the ${category.toLowerCase()} conversation this week: **${title}**. At first glance, it looks like another incremental update. It's not.`
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];

  return `### What's actually happening\n\n${intro}\n\n${description ? `To recap: ${description}. But that's just the surface.` : ``}\n\nI've been tracking this space long enough to know that not every announcement deserves a second look. This one does. Not because the headline is loud, but because the underlying details suggest a meaningful change in how things work.\n\n### Why this isn't just another update\n\n1. **The timing is suspiciously good.** Right when the industry was looking for a way to move forward without breaking everything that already exists, this shows up. That's not coincidence — that's someone reading the room.\n2. **The details matter more than the announcement.** Press releases are designed to sound impressive. What caught my eye here was the specific improvement in real-world usage, not the marketing language.\n3. **People are already arguing about it.** Scroll through any forum thread on this and you'll find two camps: the skeptics who think it's overhyped, and the early adopters who've already started experimenting. Both sides have valid points, which is always a sign something real is happening.\n\n> "I've watched a lot of ${category.toLowerCase()} trends come and go. This one feels different — not because of the hype, but because of the quiet, steady adoption I'm seeing behind the scenes."\n\n### What to actually pay attention to\n\nIf you're a developer or someone who just likes staying ahead of the curve, here's my honest take: don't chase the headline. Look at the second-order effects. How does this change the way existing tools behave? What breaks? What gets easier?\n\nIn my experience, the biggest shifts in ${category.toLowerCase()} don't announce themselves with fireworks. They show up as a small note in a changelog that slowly rewrites how everyone works. This might be one of those moments.\n\nWe'll keep watching this as more details surface. If you're experimenting with it already, I'd genuinely love to hear what's working and what isn't.\n\n*Stay tuned — this story is still unfolding.*\n\n### Trending SEO Keywords:\n* **${keyword1} ${keyword2}**\n* **${title.split(" ").slice(0, 3).join(" ")}**\n* **${category} news 2026**\n* **${keyword1} updates India**\n* **${keyword3} latest trends**`;
}
