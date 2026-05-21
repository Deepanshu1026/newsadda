export async function generateBlogArticle(title, description, category = "Technology") {
  const apiKey = process.env.SARVAM_API_KEY;
  const modelName = process.env.SARVAM_MODEL || "sarvam-105b";

  if (!apiKey) {
    console.log("[Sarvam Service] SARVAM_API_KEY is missing. Generating beautiful fallback Markdown article.");
    return generateFallbackMarkdown(title, description, category);
  }

  try {
    const prompt = `
      You are an expert Indian journalist and SEO specialist writing for NewsAdda.
      Write an extensive, highly engaging, and SEO-optimized news blog article based on the following details:
      
      Category: ${category}
      Headline Title: ${title}
      Short Summary: ${description}
      
      CRITICAL INSTRUCTIONS:
      1. Format the entire article in clean, readable Markdown.
      2. Use descriptive subheadings (###) to separate logical points.
      3. Use bold text, bullet points (1., *), and at least one high-quality blockquote (> ) to make it readable.
      4. Add a list of "Trending SEO Keywords" in a clean bulleted list at the very bottom of the post.
      5. Do NOT include the main title or the category as a header in your output. Start directly with the introduction.
      6. Make the writing authoritative, detailed, and at least 4-5 paragraphs long, providing deep context for Indian readers.
    `;

    console.log(`[Sarvam Service] Calling Sarvam AI API using model: ${modelName}`);
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
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Sarvam Service] API returned status ${response.status}: ${errText}. Using fallback.`);

      // Let's try sarvam-30b if sarvam-105b returned model not found or vice versa
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
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryText = retryData.choices?.[0]?.message?.content;
        if (retryText) return retryText;
      }

      return generateFallbackMarkdown(title, description, category);
    }

    const data = await response.json();
    console.log("[Sarvam Service] Successful API response data:", JSON.stringify(data));
    const text = data.choices?.[0]?.message?.content;
    return text || generateFallbackMarkdown(title, description, category);
  } catch (error) {
    console.error("[Sarvam Service] Error calling Sarvam AI API:", error.message);
    return generateFallbackMarkdown(title, description, category);
  }
}

// Generate highly realistic, beautiful Markdown content based on context when API is unavailable
function generateFallbackMarkdown(title, description, category) {
  const cleanTitle = title.replace(/[^\w\s]/gi, '');
  const keywords = cleanTitle.split(" ").filter(w => w.length > 4);
  const keyword1 = keywords[0] || "India";
  const keyword2 = keywords[1] || "Trending";
  const keyword3 = keywords[2] || "Update";

  return `### Detailed Insight on ${keyword1}\n\nThe latest update regarding **${title}** marks a major shift for local stakeholders and readers interested in ${category.toLowerCase()}. This development—summarized as *"${description}"*—highlights new trends and shifting patterns across the region.\n\nAs we observe these key shifts, expert analysts emphasize the importance of understanding the structural factors at play. Whether considering sports, social media viral trends, fashion, or policy guidelines, local context plays a monumental role in shaping the final impact.\n\n### Core Dynamics and Indian Context\n\nTo understand why this is such a major talking point in India, we must look at the key drivers:\n\n1. **High Public Engagement:** The topic has generated extensive conversations across digital platforms, showing strong interest from the public.\n2. **Dynamic Cultural Shift:** How modern Indian audiences consume and engage with these stories shows a rapid transformation in cultural expectations.\n3. **Socio-Economic Relevance:** This trending headline has direct implications on consumer behaviors, community guidelines, or institutional protocols.\n\n> "This trending story marks a new chapter in how we interpret ${category.toLowerCase()} developments in India. The scale of the impact is massive and signals a long-term shift."\n\n### Strategic Implications\n\nMoving forward, businesses, content creators, and policy coordinators must adapt to these updates. For instance, creating targeted campaigns around these highlights can capture organic search trends effectively. Maintaining high-quality coverage ensures credibility and trust in a crowded digital landscape.\n\n### Looking Ahead to Future Updates\n\nAs the situation evolves, we expect further statements and public reactions from industry representatives. Adapting quickly to these shifts requires a deep appreciation for the emerging paradigms of ${category.toLowerCase()} in the region.\n\nWe will continue to update this article as more information and details are officially released by active coordinates.\n\n### Trending SEO Keywords:\n* **${keyword1} India**\n* **${title.split(" ").slice(0, 3).join(" ")}**\n* **${category} trends 2026**\n* **India ${keyword2} news**`;
}
