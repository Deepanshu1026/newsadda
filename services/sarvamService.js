import { searchNewsForHeadline } from "./newsService";

export async function generateBlogArticle(title, description, category = "Technology") {
  const apiKey = process.env.SARVAM_API_KEY;
  const modelName = process.env.SARVAM_MODEL || "sarvam-105b";

  // Pre-fetch live search context for the headline to enrich both API prompts and fallbacks
  let searchContext = "";
  try {
    const searchResults = await searchNewsForHeadline(title);
    if (searchResults && searchResults.length > 0) {
      searchContext = searchResults.map((r, i) => `[News Coverage #${i+1}] Title: ${r.title}\nContext: ${r.description}`).join("\n\n");
    }
  } catch (e) {
    console.warn("[Sarvam Service] Background news search failed, proceeding with original details:", e.message);
  }

  if (!apiKey) {
    console.log("[Sarvam Service] SARVAM_API_KEY is missing. Generating beautiful dynamic fallback Markdown article.");
    return generateFallbackMarkdown(title, description, category, searchContext);
  }

  try {
    const prompt = `
      You are an expert Indian journalist and SEO specialist writing for NewsAdda.
      Write an extensive, highly engaging, and SEO-optimized news blog article based on the following details:
      
      Category: ${category}
      Headline Title: ${title}
      Short Summary: ${description}
      
      ${searchContext ? `Here is the real-time background search coverage we fetched for this headline. Use these actual facts, details, and context to enrich your article:\n\n${searchContext}\n` : ""}
      
      CRITICAL INSTRUCTIONS FOR LENGTH, QUALITY & SEO:
      1. The article MUST be comprehensive, detailed, and moderately long-form (around 500 to 700 words). It is CRITICAL that you budget your generation length to fully complete the entire article and do not get cut off. Ensure the article is fully written, concluded, and polished.
      2. Format the entire article in clean, professional Markdown.
      3. Use highly descriptive subheadings (###) to separate logical sections (e.g., Background Analysis, Core Dynamics, Key Developments, and Strategic Implications).
      4. Use bold text, bullet points (1., *), and at least one high-quality blockquote (> ) to make the post highly readable and engaging.
      5. Identify 4-6 highly relevant, trending SEO keywords based on the headline and search context. Integrate these keywords naturally with high density throughout the text to boost trending rank.
      6. Add a list of "Trending SEO Keywords" in a clean bulleted list at the very bottom of the post.
      7. Do NOT include the main title or the category as a header in your output. Start directly with the introduction.
      8. Write in an authoritative, analytical, and gripping tone tailored for Indian and global readers.
    `;

    console.log(`[Sarvam Service] Calling Sarvam AI API using model: ${modelName} with max_tokens: 2500, reasoning_effort: low`);
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2500,
        reasoning_effort: "low",
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Sarvam Service] API returned status ${response.status}: ${errText}. Attempting secondary model fallback.`);

      const secondaryModel = modelName === "sarvam-105b" ? "sarvam-30b" : "sarvam-105b";
      console.log(`[Sarvam Service] Retrying with secondary model: ${secondaryModel}`);

      const retryResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey
        },
        body: JSON.stringify({
          model: secondaryModel,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2500,
          reasoning_effort: "low",
          temperature: 0.7
        })
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryText = retryData.choices?.[0]?.message?.content;
        if (retryText) return retryText;
      }

      return generateFallbackMarkdown(title, description, category, searchContext);
    }

    const data = await response.json();
    console.log("[Sarvam Service] Successful API response data:", JSON.stringify(data));
    const text = data.choices?.[0]?.message?.content;
    return text || generateFallbackMarkdown(title, description, category, searchContext);
  } catch (error) {
    console.error("[Sarvam Service] Error calling Sarvam AI API:", error.message);
    return generateFallbackMarkdown(title, description, category, searchContext);
  }
}

// Generate highly realistic, beautiful Markdown content based on context when API is unavailable
function generateFallbackMarkdown(title, description, category, searchContext = "") {
  const cleanTitle = title.replace(/[^\w\s]/gi, '');
  const keywords = cleanTitle.split(/\s+/).filter(w => w.length > 4);
  const keyword1 = keywords[0] || "India";
  const keyword2 = keywords[1] || "Trending";
  const keyword3 = keywords[2] || "Update";

  let contextSection = "";
  if (searchContext && searchContext.trim().length > 0) {
    contextSection = `### Real-Time Investigations & Search Analysis\n\nDeep-dive coverage across leading national news outlets offers valuable context on these events. Key details compiled from current reports reveal significant facets of this story:\n\n`;
    
    const items = searchContext.split("\n\n").filter(x => x.includes("Title:"));
    items.forEach((item, idx) => {
      const lines = item.split("\n");
      const subTitle = lines[0].replace("[News Coverage #" + (idx+1) + "] Title: ", "").replace("Title: ", "").trim();
      const subDesc = lines[1].replace("Context: ", "").replace("Description: ", "").trim();
      
      contextSection += `#### ${idx + 1}. ${subTitle}\n${subDesc}\n\n`;
    });
  } else {
    contextSection = `### Real-Time Investigations & Search Analysis\n\nNo secondary web search context could be retrieved in real time. However, field reports indicate a massive public reaction to this development. Observers suggest that regulatory bodies and policy specialists are currently reviewing standard guidelines to formulate updated responses.\n\n`;
  }

  return `### Comprehensive Analysis: ${title}

The latest update regarding **${title}** marks a major shift for local stakeholders and readers interested in **${category}**. This development—summarized as *"${description}"*—highlights new trends and shifting patterns across the region, sparking intense public discussions and media coverage.

As we observe these key shifts, expert analysts emphasize the importance of understanding the structural factors at play. Whether considering legislative policies, societal impacts, or cultural changes, local context plays a monumental role in shaping the final outcome.

${contextSection}

### Core Dynamics and Indian Context

To understand why this has become such an important talking point across the country, we must look at the key drivers shaping the public narrative:

1. **High Public Engagement:** The topic has generated extensive conversations across digital platforms, showing strong interest from the public. Citizens are demanding transparency and immediate action.
2. **Dynamic Cultural Shift:** How modern Indian audiences consume and engage with these stories shows a rapid transformation in cultural expectations and awareness.
3. **Socio-Economic Relevance:** This trending headline has direct implications on consumer behaviors, community guidelines, or institutional protocols, forcing quick adaptations.

> "This trending story marks a new chapter in how we interpret ${category.toLowerCase()} developments in India. The scale of the impact is massive and signals a long-term shift."

### Strategic Implications and Future Outlook

Moving forward, businesses, content creators, and policy coordinators must adapt to these updates. For instance, creating targeted campaigns around these highlights can capture organic search trends effectively. Maintaining high-quality coverage ensures credibility and trust in a crowded digital landscape.

As the situation evolves, we expect further statements and public reactions from industry representatives and legal authorities. Adapting quickly to these shifts requires a deep appreciation for the emerging paradigms in the region.

We will continue to update this article as more information and details are officially released by active coordinates.

### Trending SEO Keywords:
* **${keyword1} India**
* **${title.split(" ").slice(0, 3).join(" ")}**
* **${category} trends 2026**
* **India ${keyword2} news**
* **${keyword1} ${keyword3} Updates**`;
}
