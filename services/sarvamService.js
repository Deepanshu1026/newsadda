import { searchNewsForHeadline } from "./newsService";

// --- Shared helper: pre-fetch news context ---
async function getSearchContext(title, language = "en") {
  try {
    const searchResults = await searchNewsForHeadline(title, language);
    if (searchResults && searchResults.length > 0) {
      return searchResults.map((r, i) => `[News Coverage #${i + 1}] Title: ${r.title}\nContext: ${r.description}`).join("\n\n");
    }
  } catch (e) {
    console.warn("[Sarvam Service] Background news search failed, proceeding with original details:", e.message);
  }
  return "";
}

// --- English blog generator ---
export async function generateBlogArticle(title, description, category = "Technology") {
  const apiKey = process.env.SARVAM_API_KEY;
  const modelName = process.env.SARVAM_MODEL || "sarvam-105b";

  const searchContext = await getSearchContext(title, "en");

  if (!apiKey) {
    console.log("[Sarvam Service] SARVAM_API_KEY is missing. Generating beautiful dynamic fallback Markdown article.");
    return generateFallbackMarkdown(title, description, category, searchContext);
  }

  const prompt = `
You are a seasoned Indian news reporter writing for NewsAdda — a popular digital news platform. Your job is to write a compelling, human-sounding news blog that feels like it was written by a real journalist, not an AI.

Category: ${category}
Headline Title: ${title}
Short Summary: ${description}

${searchContext ? `Here is the real-time background search coverage we fetched for this headline. Use these actual facts, details, and context to enrich your article:\n\n${searchContext}\n` : ""}

CRITICAL INSTRUCTIONS — WRITE LIKE A HUMAN JOURNALIST WITH AN ANALYTICAL PATTERN:
1. The article MUST be **at least 500 to 800 words**. Finish completely with a proper closing section. Do not trail off.
2. The article content MUST strictly follow this exact Markdown structure:

### Introduction
[A strong, gripping editorial hook that goes beyond basic facts to set the tone, stakes, and narrative for the article. Make it an engaging opening.]

### Context
[A detailed explanation of the event context, timeline, participants, and immediate settings.]

### Background Information
[Provide historical context, preceding events, team/person history, and prior trends that led up to this point.]

### Analysis
[A deep analytical breakdown of the event, discussing key player performances, strategy execution, expert quotes/opinions, and tactical elements or broader implications.]

### Key Takeaways
- [High-impact takeaway 1]
- [High-impact takeaway 2]
- [High-impact takeaway 3]
- [High-impact takeaway 4]

### Conclusion
[What happens next, future prospects, tournament/industry impact, next matches, or subsequent developments.]

### Trending SEO Keywords
- [Natural SEO Tag 1]
- [Natural SEO Tag 2]
- [Natural SEO Tag 3]
- [Natural SEO Tag 4]
- [Natural SEO Tag 5]

3. Do NOT include the main title or the category as a header at the top of the output. Start directly with the "### Introduction" section.
4. Use bold, bullet points, and ONE blockquote. Make it scannable but not sterile.
5. Inject 4-6 natural SEO keywords into the flow. Don't stuff them awkwardly.
6. TONE RULES (this is critical — break these and the article sounds like a bot):
   - Use contractions: don't, can't, it's, that's, won't, we're.
   - Mix short punchy sentences with longer ones. Not every sentence needs to be perfect grammar.
   - Start some paragraphs casually: "Here's the thing.", "Most people missed this.", "What's interesting is..."
   - Use rhetorical questions sometimes: "So what does this actually mean for you?"
   - Avoid AI poison words: NEVER use "delve", "landscape", "tapestry", "robust", "multifaceted", "in today's fast-paced world", "cascade", "pivotal", "paramount", "foster", "leverage", "synergy", "holistic", "nexus", "paradigm", "convergence", "stakeholders", "actionable insights", "moving forward", "it is important to note".
   - Use plain English. If you wouldn't say it out loud to a friend in a cafe, don't write it.
   - Add human touches: "I was surprised to see...", "Here's what caught my attention.", "Not everyone agrees, though."
   - Use real comparisons and analogies when explaining complex stuff.
   - Vary sentence openings. Don't start three paragraphs in a row with "The..." or "This..."
   - For tech topics, explain like you're talking to a smart friend, not a textbook.
   - Use numbers and specifics when possible: "₹2.4 crore", "3 out of 5 people", "last Tuesday".
7. The tone should feel like a mid-day news analysis — informed, slightly opinionated, easy to read, and genuinely useful.
`;

  const callApi = async (targetModel, maxTokens) => {
    return fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        reasoning_effort: "low",
        temperature: 0.85
      })
    });
  };

  try {
    console.log(`[Sarvam Service] Calling Sarvam AI API using model: ${modelName} with max_tokens: 4096`);
    let response = await callApi(modelName, 4096);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Sarvam Service] API returned status ${response.status}: ${errText}. Attempting secondary model fallback.`);
      const secondaryModel = modelName === "sarvam-105b" ? "sarvam-30b" : "sarvam-105b";
      console.log(`[Sarvam Service] Retrying with secondary model: ${secondaryModel}`);
      response = await callApi(secondaryModel, 4096);
    }

    if (!response.ok) {
      return generateFallbackMarkdown(title, description, category, searchContext);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text || text.trim().length < 400) {
      console.warn("[Sarvam Service] Generated text too short or empty, falling back.");
      return generateFallbackMarkdown(title, description, category, searchContext);
    }
    return text;
  } catch (error) {
    console.error("[Sarvam Service] Error calling Sarvam AI API:", error.message);
    return generateFallbackMarkdown(title, description, category, searchContext);
  }
}

// --- Hindi blog generator ---
export async function generateHindiBlogArticle(title, description, category = "Technology") {
  const apiKey = process.env.SARVAM_API_KEY;
  const modelName = process.env.SARVAM_MODEL || "sarvam-105b";

  const searchContext = await getSearchContext(title, "hi");

  if (!apiKey) {
    console.log("[Sarvam Service] SARVAM_API_KEY is missing. Generating Hindi fallback Markdown article.");
    return generateHindiFallbackMarkdown(title, description, category, searchContext);
  }

  const prompt = `
आप NewsAdda के लिए एक अनुभवी भारतीय रिपोर्टर हैं। आपको ऐसा समाचार लेख हिंदी में लिखना है जो एक असली इंसान ने लिखा हो — कोई AI नहीं। बोलचाल की हिंदी में लिखें, न कि किताबी हिंदी में।

श्रेणी: ${category}
शीर्षक: ${title}
संक्षिप्त सारांश: ${description}

${searchContext ? `यहां वास्तविक समय की पृष्ठभूमि खोज कवरेज है जो हमने इस शीर्षक के लिए प्राप्त की है। इन वास्तविक तथ्यों, विवरणों और संदर्भ का उपयोग अपने लेख को समृद्ध करने के लिए करें:\n\n${searchContext}\n` : ""}

महत्वपूर्ण निर्देश — इंसानों की तरह लिखें और दी गई संरचना का पालन करें:
1. लेख **कम से कम 500-800 शब्दों** का हो। अंत तक पूरा लिखें, बीच में न रुकें।
2. लेख की संरचना बिल्कुल इस प्रकार होनी चाहिए (Markdown headers):

### Introduction
[एक आकर्षक और गहरा प्रारंभिक हुक जो बुनियादी तथ्यों से परे जाकर लेख की टोन और दांव को सेट करता है।]

### Context
[घटना के संदर्भ, समयरेखा, शामिल लोगों और तत्काल सेटिंग्स का विस्तृत विवरण।]

### Background Information
[इस क्षण तक ले जाने वाले ऐतिहासिक संदर्भ, पिछले प्रदर्शन, पूर्ववर्ती घटनाओं या अंतर्निहित रुझानों को प्रदान करें।]

### Analysis
[घटना का गहरा विश्लेषण, जिसमें प्रमुख खिलाड़ियों के प्रदर्शन, रणनीति, विशेषज्ञों की राय और व्यापक निहितार्थ शामिल हों।]

### Key Takeaways
- [महत्वपूर्ण निष्कर्ष 1]
- [महत्वपूर्ण निष्कर्ष 2]
- [महत्वपूर्ण निष्कर्ष 3]
- [महत्वपूर्ण निष्कर्ष 4]

### Conclusion
[आगे क्या होगा, भविष्य की संभावनाएं, टूर्नामेंट/उद्योग पर प्रभाव और अगली कड़ियाँ क्या होंगी।]

### Trending SEO Keywords
- [प्राकृतिक रूप से प्रासंगिक कीवर्ड 1]
- [प्राकृतिक रूप से प्रासंगिक कीवर्ड 2]
- [प्राकृतिक रूप से प्रासंगिक कीवर्ड 3]
- [प्राकृतिक रूप से प्रासंगिक कीवर्ड 4]
- [प्राकृतिक रूप से प्रासंगिक कीवर्ड 5]

3. सीधे कहानी में कूदें — शीर्षक को हेडर न बनाएं। सीधे "### Introduction" से शुरू करें।
4. बोल्ड, बुलेट पॉइंट्स और एक ब्लॉककोट (> ) का उपयोग करें।
5. 4-6 SEO कीवर्ड को प्राकृतिक रूप से लेख में घुसाएं। जबरदस्ती न लगाएं।
6. टोन के नियम:
   - बोलचाल की हिंदी में लिखें। "हम", "आप", "यहाँ", "वहाँ" जैसे शब्दों का उपयोग करें।
   - संक्षिप्त और लंबे वाक्य मिलाएं। हर वाक्य का व्याकरण सही हो, यह ज़रूरी नहीं.
   - कुछ पैराग्राफ़ अनौपचारिक तरीके से शुरू करें: "यहाँ बात यह है...", "ज़्यादातर लोग इसे नोटिस नहीं करते...", "दिलचस्प बात यह है..."
   - कभी-कभी प्रश्न पूछें: "तो इसका आप पर क्या असर पड़ेगा?"
   - AI ज़हर शब्दों से बचें: "परिदृश्य", "टेपेस्ट्री", "मजबूत", "बहुआयामी", "वर्तमान तेज गति वाली दुनिया में", "झरना", "महत्वपूर्ण", "परम", "पोषण", "उत्तोलन", "सहजीवन", "समग्र", "केन्द्रबिंदु", "प्रतिमान", "अभिसरण", "हितधारक", "कार्यक्षम अंतर्दृष्टि", "आगे बढ़ते हुए", "यह ध्यान देना महत्वपूर्ण है" — इन शब्दों का कभी उपयोग न करें।
   - सरल हिंदी में लिखें। ऐसी हिंदी जो आप किसी दोस्त से कैफे में बात करते समय बोलेंगे।
   - मानवीय स्पर्श दें: "मुझे यह जानकर हैरानी हुई...", "यहाँ मेरा ध्यान इस बात पर गया...", "हर किसी की राय एक जैसी नहीं है।"
   - तुलना और उदाहरण दें।
   - वाक्यों की शुरुआत बदलें। लगातार "यह..." या "इस..." से शुरू न करें।
   - संख्याएं और विशिष्ट विवरण दें: "₹2.4 करोड़", "5 में से 3 लोग", "पिछले मंगलवार"।
   - कभी-कभी हल्के हास्य या व्यंग्य का उपयोग करें।
7. टोन: दोपहर के समाचार विश्लेषण जैसा — जानकार, थोड़ा राय वाला, आसानी से पढ़ने योग्य, और वास्तव में उपयोगी।
`;

  const callApi = async (targetModel, maxTokens) => {
    return fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        reasoning_effort: "low",
        temperature: 0.85
      })
    });
  };

  try {
    console.log(`[Sarvam Service] Calling Sarvam AI API (Hindi) using model: ${modelName} with max_tokens: 4096`);
    let response = await callApi(modelName, 4096);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Sarvam Service] Hindi API returned status ${response.status}: ${errText}. Attempting secondary model fallback.`);
      const secondaryModel = modelName === "sarvam-105b" ? "sarvam-30b" : "sarvam-105b";
      response = await callApi(secondaryModel, 4096);
    }

    if (!response.ok) {
      return generateHindiFallbackMarkdown(title, description, category, searchContext);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text || text.trim().length < 400) {
      console.warn("[Sarvam Service] Hindi generated text too short or empty, falling back.");
      return generateHindiFallbackMarkdown(title, description, category, searchContext);
    }
    return text;
  } catch (error) {
    console.error("[Sarvam Service] Error calling Sarvam AI API for Hindi:", error.message);
    return generateHindiFallbackMarkdown(title, description, category, searchContext);
  }
}

// --- English fallback ---
function generateFallbackMarkdown(title, description, category, searchContext = "") {
  const cleanTitle = title.replace(/[^\w\s]/gi, "");
  const keywords = cleanTitle.split(/\s+/).filter((w) => w.length > 4);
  const keyword1 = keywords[0] || "India";
  const keyword2 = keywords[1] || "trending";
  const keyword3 = keywords[2] || "update";

  let contextSection = "";
  if (searchContext && searchContext.trim().length > 0) {
    contextSection = `We pulled together what different outlets are reporting right now — here's the gist:\n\n`;
    const items = searchContext.split("\n\n").filter((x) => x.includes("Title:"));
    items.slice(0, 3).forEach((item, idx) => {
      const lines = item.split("\n");
      const subTitle = lines[0].replace(/\[News Coverage #\d+\] Title: |Title: /g, "").trim();
      const subDesc = lines[1]?.replace(/Context: |Description: /g, "").trim() || "";
      contextSection += `**${subTitle}** — ${subDesc}\n\n`;
    });
  }

  const intros = [
    `If you've been following ${category.toLowerCase()} news lately, you probably saw **${title}** pop up everywhere. Honestly? It's a bigger deal than most people realize at first glance.`,
    `**${title}** — sounds like just another headline until you actually dig into what's going on. And trust me, there's more here than meets the eye.`,
    `Here's the thing about **${title}**: most coverage so far has skimmed the surface. But when you break it down, the implications are genuinely significant for anyone tracking ${category.toLowerCase()} in India.`
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];

  const middles = [
    `For starters, this isn't happening in isolation. Across the country, people are reacting differently depending on where they sit — consumers, policymakers, even regular folks scrolling through their feeds. What struck me while looking at the details was how quickly the conversation shifted from "this is interesting" to "this actually affects me."`,
    `What's caught my attention is the speed at which this story moved. One day it's a minor update, and within 48 hours it's dominating discussions everywhere from Twitter threads to family WhatsApp groups. That's usually a sign something real is brewing beneath the surface.`
  ];
  const middle = middles[Math.floor(Math.random() * middles.length)];

  const closings = [
    `We'll keep watching this closely. As more details come out — and they will — we'll update this piece. For now, it's safe to say this story isn't going anywhere soon.`,
    `My guess? We're still in the early chapters of this story. Keep this page bookmarked — we'll refresh it as the situation unfolds.`
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `### Introduction

${intro}

${description ? `To sum it up briefly: ${description}. But that's just the headline version.` : ""}

### Context

${contextSection || `This event takes place within the context of recent developments in the ${category.toLowerCase()} category in India.`}

### Background Information

Historically, key events in this category have followed predictable paths. However, this development represents a major shift. Preceding events and trends suggest that the current scenario is forcing players and observers alike to adapt.

### Analysis

${middle}

Here are the key observations shaping this development:
1. **High Public Engagement:** Not just journalists — everyday citizens are discussing it. That kind of organic buzz is hard to fake and usually means something real is shifting.
2. **Strategic Timing:** Depending on how this plays out over the next few weeks, we could see ripple effects in related areas — consumer habits, public sentiment, even policy tweaks.
3. **Confusion mixed with curiosity:** Scroll through the comments on any post about this and you'll see a split: some people think it's overblown, others think it's been a long time coming.

> "I've been tracking ${category.toLowerCase()} developments for a while, and honestly, this one feels different. The public reaction alone tells you something's changed."

### Key Takeaways
- The event has generated significant digital discussion across digital platforms.
- It highlights dynamic cultural shifts in consumer expectations and awareness.
- Direct implications are visible on consumer behaviors, community guidelines, or institutional protocols.
- Observers suggest that regulatory bodies and specialists are reviewing guidelines to adapt.

### Conclusion

${closing}

*Got thoughts? This story is evolving, and we'd love to hear what you're seeing in your corner of the country.*

### Trending SEO Keywords
- ${keyword1} India
- ${title.split(" ").slice(0, 2).join(" ")}
- ${category} trends 2026
- India ${keyword2} news
- ${keyword1} ${keyword3} updates`;
}

// --- Hinglish blog generator ---
export async function generateHinglishBlogArticle(title, description, category = "Technology") {
  const apiKey = process.env.SARVAM_API_KEY;
  const modelName = process.env.SARVAM_MODEL || "sarvam-105b";

  const searchContext = await getSearchContext(title, "en"); // Hinglish uses English news search

  if (!apiKey) {
    console.log("[Sarvam Service] SARVAM_API_KEY is missing. Generating Hinglish fallback Markdown article.");
    return generateHinglishFallbackMarkdown(title, description, category, searchContext);
  }

  const prompt = `
You are a popular Indian news blogger writing for NewsAdda in HINGLISH — the way Indians actually talk and read online. Hindi words in Roman script, mixed casually with English. Not formal. Not textbook. Real.

Category: ${category}
Headline Title: ${title}
Short Summary: ${description}

${searchContext ? `Here is the real-time background search coverage we fetched for this headline. Use these actual facts, details, and context to enrich your article:\n\n${searchContext}\n` : ""}

CRITICAL INSTRUCTIONS — WRITE LIKE A REAL INDIAN BLOGGER WITH AN ANALYTICAL PATTERN:
1. The article MUST be **at least 500-800 words**. Finish completely. No cut-offs.
2. The article content MUST strictly follow this exact Markdown structure:

### Introduction
[Desi style hook starting casually to set the context and hook the reader. Explain the buzz in simple words.]

### Context
[Explain the event setting, who was involved, and what exactly happened in a timeline format.]

### Background Information
[Peechhe ki kahani: historical details, team history, or preceding events leading to this moment.]

### Analysis
[Gahri analysis: key performances, strategies, expert observations, or what people are discussing online.]

### Key Takeaways
- [Desi takeaway 1]
- [Desi takeaway 2]
- [Desi takeaway 3]
- [Desi takeaway 4]

### Conclusion
[Aage kya hoga: future predictions, impact on tournaments/industry, and the next developments.]

### Trending SEO Keywords
- [Hinglish/English SEO Tag 1]
- [Hinglish/English SEO Tag 2]
- [Hinglish/English SEO Tag 3]
- [Hinglish/English SEO Tag 4]
- [Hinglish/English SEO Tag 5]

3. Do NOT start with the title as a header. Start directly with the "### Introduction" section.
4. Use bold, bullet points, ONE blockquote.
5. Inject 4-6 natural SEO keywords (in Hinglish, e.g. "cricket news hindi", "india latest update", "trending khabar") smoothly into the text.
6. TONE RULES — this is the MOST important part:
   - Write exactly like Indians chat on WhatsApp or comment on Twitter/X. Casual, energetic, sometimes funny.
   - Use natural Hinglish: "Dekho bhai", "yeh toh clear hai", "ab aap soch rahe honge", "honestly bolun toh", "mujhe lagta hai", "fact ye hai", "desh bhar mein log is baat se quite excited hain".
   - Mix short and long sentences. Throw in one-word sentences sometimes: "Seriously."
   - Start paragraphs casually: "Here's the thing.", "Ab baat aati hai...", "Most people miss this.", "Sach bataun toh..."
   - Ask rhetorical questions: "So ab kya hoga?", "Aap soch rahe honge ki iska matlab kya?"
   - NEVER use these AI poison words in ANY language: "delve", "landscape", "tapestry", "robust", "multifaceted", "in today's fast-paced world", "cascade", "pivotal", "paramount", "foster", "leverage", "synergy", "holistic", "nexus", "paradigm", "convergence", "stakeholders", "actionable insights", "moving forward", "it is important to note".
   - Use plain language you'd use with friends over chai. Explain complex stuff with desi analogies.
   - Add personal reactions: "Mujhe yeh dekhke thoda surprise laga...", "Honestly, yeh decision bahut bold hai.", "Sabki opinion alag hai ispar."
   - Use real numbers and specifics: "₹2.4 crore", "3 mein se 5 log", "last Tuesday ko".
   - Vary sentence beginnings. Don't start three paragraphs with "The..." or "Yeh..."
   - It's OK to be slightly opinionated. Indian readers trust bloggers who have a point of view.
   - Occasionally use ALL CAPS for emphasis (not shouting, just emphasis): "This is HUGE."
7. The vibe: like a popular Indian news YouTuber or Instagram blogger explaining the story to their followers — smart, quick, opinionated, and 100% human.
`;

  const callApi = async (targetModel, maxTokens) => {
    return fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        reasoning_effort: "low",
        temperature: 0.7
      })
    });
  };

  try {
    console.log(`[Sarvam Service] Calling Sarvam AI API (Hinglish) using model: ${modelName} with max_tokens: 4096`);
    let response = await callApi(modelName, 4096);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Sarvam Service] Hinglish API returned status ${response.status}: ${errText}. Attempting secondary model fallback.`);
      const secondaryModel = modelName === "sarvam-105b" ? "sarvam-30b" : "sarvam-105b";
      response = await callApi(secondaryModel, 4096);
    }

    if (!response.ok) {
      return generateHinglishFallbackMarkdown(title, description, category, searchContext);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text || text.trim().length < 400) {
      console.warn("[Sarvam Service] Hinglish generated text too short or empty, falling back.");
      return generateHinglishFallbackMarkdown(title, description, category, searchContext);
    }
    return text;
  } catch (error) {
    console.error("[Sarvam Service] Error calling Sarvam AI API for Hinglish:", error.message);
    return generateHinglishFallbackMarkdown(title, description, category, searchContext);
  }
}

// --- Hindi fallback ---
function generateHindiFallbackMarkdown(title, description, category, searchContext = "") {
  const cleanTitle = title.replace(/[^\w\s]/gi, "");
  const keywords = cleanTitle.split(/\s+/).filter((w) => w.length > 3);
  const keyword1 = keywords[0] || "भारत";
  const keyword2 = keywords[1] || "ट्रेंडिंग";
  const keyword3 = keywords[2] || "अपडेट";

  let contextSection = "";
  if (searchContext && searchContext.trim().length > 0) {
    contextSection = `हमने देखा कि अलग-अलग न्यूज़ आउटलेट्स इस पर क्या रिपोर्ट कर रहे हैं — यहां मुख्य बातें:\n\n`;
    const items = searchContext.split("\n\n").filter((x) => x.includes("Title:"));
    items.slice(0, 3).forEach((item, idx) => {
      const lines = item.split("\n");
      const subTitle = lines[0].replace(/\[News Coverage #\d+\] Title: |Title: /g, "").trim();
      const subDesc = lines[1]?.replace(/Context: |Description: /g, "").trim() || "";
      contextSection += `**${subTitle}** — ${subDesc}\n\n`;
    });
  }

  const intros = [
    `अगर आप **${category}** की खबरें फॉलो कर रहे हैं, तो आपने शायद **${title}** को हर जगह देखा होगा। सच कहूं तो, पहली नज़र में जितना साधारण लगता है, यह उतना है नहीं।`,
    `**${title}** — सुनने में बस एक और हेडलाइन लगती है, लेकिन जब आप इसके पीछे जाकर देखते हैं तो पता चलता है कि यहां बहुत कुछ चल रहा है।`,
    `यहाँ बात यह है: **${title}** के बारे में अभी तक ज़्यादातर कवरेज सतही रही है। लेकिन जब आप इसे तोड़कर समझते हैं, तो मामला काफी गंभीर नज़र आता है।`
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];

  const middles = [
    `सबसे पहले, यह अकेले नहीं हो रहा है। देश भर में लोग अलग-अलग तरीके से प्रतिक्रिया दे रहे हैं। जो बात मुझे सबसे ज़्यादा चौंकाती है, वह यह है कि कैसे बात "यह दिलचस्प है" से "इसका असर सीधे मुझ पर पड़ रहा है" में बदल गई।`,
    `जो मेरी नज़र में आया, वह यह है कि यह खबर कितनी तेज़ी से फैली। एक दिन यह एक छोटी सी अपडेट थी, और 48 घंटे के भीतर यह Twitter से लेकर फैमिली WhatsApp ग्रुप्स तक हर जगह छा गई। यह आमतौर पर एक संकेत है कि सतह के नीचे कुछ बड़ा हो रहा है।`
  ];
  const middle = middles[Math.floor(Math.random() * middles.length)];

  const closings = [
    `हम इसे बारीकी से देखते रहेंगे। जैसे-जैसे और जानकारी सामने आएगी — और आएगी — हम इसे अपडेट करेंगे। अभी के लिए, यह कहना सही रहेगा कि यह कहानी जल्दी खत्म नहीं होने वाली।`,
    `मेरा अनुमान? यह कहानी अभी शुरुआती दौर में है। इस पेज को बुकमार्क करें — हम जैसे-जैसे नए अपडेट आएंगे, यहां जोड़ते रहेंगे।`
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `### Introduction

${intro}

${description ? `मुख्य सारांश: ${description}। लेकिन यह सिर्फ हेडलाइन वाला संस्करण है।` : ""}

### Context

${contextSection || `यह घटना भारत में ${category} श्रेणी में हाल के घटनाक्रमों के संदर्भ में हुई है।`}

### Background Information

अतीत में, इस श्रेणी में घटनाक्रम सामान्य पैटर्न के अनुसार रहे हैं, लेकिन वर्तमान स्थिति एक नया मोड़ दर्शाती है। भारत में पिछले रुझान इस बात की ओर इशारा करते हैं कि इस मुद्दे पर जनता की राय तेजी से बदल रही है।

### Analysis

${middle}

यहाँ मुख्य अवलोकन दिए गए हैं:
1. **उच्च सार्वजनिक जुड़ाव:** केवल पत्रकार ही नहीं — आम लोग भी इस पर सक्रिय रूप से चर्चा कर रहे हैं। इस तरह की प्राकृतिक चर्चा को नकली नहीं किया जा सकता, और यह आमतौर पर एक असली बदलाव का संकेत देती है।
2. **टाइमिंग अजीब है (या परफेक्ट, यह निर्भर करता है कि आप किस तरफ हैं)।** अगले कुछ हफ्तों में इसका असर कई क्षेत्रों में दिख सकता है — उपभोक्ता आदतों, जनमत, यहां तक कि नीतियों में भी।
3. **लोग उलझन और जिज्ञासा दोनों में हैं:** किसी भी पोस्ट के कमेंट्स पढ़िए, आपको दो राय मिलेंगी: कुछ लोग कह रहे हैं कि यह बढ़ा-चढ़ाकर कहा गया है, कुछ कह रहे हैं कि यह काफी समय से होना चाहिए था।

> "मैं ${category} में बदलाव काफी समय से ट्रैक कर रहा हूं, और सच कहूं तो यह एक अलग ही फील देता है। जनता की प्रतिक्रिया अपने आप में बहुत कुछ बता देती है।"

### Key Takeaways
- इस घटना ने डिजिटल प्लेटफॉर्म पर भारी चर्चा पैदा की है, जो जनता की गहरी रुचि को दर्शाती है।
- यह दर्शकों की बदलती सांस्कृतिक अपेक्षाओं और जागरूकता में बदलाव को रेखांकित करता है।
- इसके रणनीतिक प्रभाव दूरगामी हैं, जो उपभोक्ता व्यवहार और संस्थागत प्रोटोकॉल को प्रभावित करते हैं।
- हम निकट भविष्य में नियामक निकायों और प्रमुख हस्तियों से और बयानों की उम्मीद करते हैं।

### Conclusion

${closing}

*आपको क्या लगता है? यह कहानी बदल रही है, और हम आपकी राय भी सुनना चाहेंगे।*

### Trending SEO Keywords
- ${keyword1} भारत
- ${title.split(" ").slice(0, 2).join(" ")}
- ${category} trends 2026
- भारत ${keyword2} समाचार
- ${keyword1} ${keyword3} अपडेट्स`;
}

// --- Hinglish fallback ---
function generateHinglishFallbackMarkdown(title, description, category, searchContext = "") {
  const cleanTitle = title.replace(/[^\w\s]/gi, "");
  const keywords = cleanTitle.split(/\s+/).filter((w) => w.length > 3);
  const keyword1 = keywords[0] || "India";
  const keyword2 = keywords[1] || "trending";
  const keyword3 = keywords[2] || "update";

  let contextSection = "";
  if (searchContext && searchContext.trim().length > 0) {
    contextSection = `Humne dekha ki alag-alag news channels is par kya report kar rahe hain — yeh raha main summary:\n\n`;
    const items = searchContext.split("\n\n").filter((x) => x.includes("Title:"));
    items.slice(0, 3).forEach((item, idx) => {
      const lines = item.split("\n");
      const subTitle = lines[0].replace(/\[News Coverage #\d+\] Title: |Title: /g, "").trim();
      const subDesc = lines[1]?.replace(/Context: |Description: /g, "").trim() || "";
      contextSection += `**${subTitle}** — ${subDesc}\n\n`;
    });
  }

  const intros = [
    `Dekho bhai, agar aap **${category}** ki khabrein follow kar rahe ho, toh **${title}** ko har jagah dekh lia hoga. Honestly? Pehli nazar mein jitna normal lagta hai, utna hai nahi.`,
    `**${title}** — sunne mein bas ek aur headline lagti hai, lekin jab aap andar jaake dekhte ho toh pata chalta ki yahan bahut kuch chal raha hai.`,
    `Yeh raha scene: **${title}** ke baare mein abhi tak zyadatar coverage surface level thi. Lekin jab break down karte ho, toh implications genuinely significant hain.`
  ];
  const intro = intros[Math.floor(Math.random() * intros.length)];

  const middles = [
    `Sabse pehle, yeh akela nahi ho raha hai. Desh bhar mein log alag-alag tarike se react kar rahe hain — Twitter pe memes se lekar ghar ke WhatsApp groups mein serious discussion tak. Mujhe jo sabse zyada interesting laga, woh yeh tha ki kaise "yeh toh interesting hai" se "yeh actually meri life mein asar daal raha hai" mein convert ho gaya.`,
    `Jo cheez mujhe pakad gayi, woh thi speed. Ek din yeh chhoti si update thi, aur 48 ghante ke andar yeh Twitter threads se lekar family WhatsApp groups tak har jagah dominant ho gayi. Yeh usually ek sign hota hai ki surface ke neeche kuch real ho raha hai.`
  ];
  const middle = middles[Math.floor(Math.random() * middles.length)];

  const closings = [
    `Hum isse closely track karte rahenge. Jaise-jaise aur details aayengi — aur aayengi — hum update karenge. Abhi ke liye itna safe kehna hai ki yeh story jaldi khatam nahi hone wali.`,
    `Mera guess? Hum abhi bhi is story ke shuruati chapters mein hain. Is page ko bookmark kar lo — hum refresh karte rahenge jaisi-jaisi situation unfold hoti hai.`
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  return `### Introduction

${intro}

${description ? `Ek line mein samjhaun toh: ${description}. Lekin yeh sirf headline wala version hai.` : ""}

### Context

${contextSection || `Yeh event India mein ${category.toLowerCase()} category ke recent developments ke context mein hua hai.`}

### Background Information

Historically, key events in this category have followed predictable paths. However, this development represents a major shift. Preceding events and trends suggest that the current scenario is forcing players and observers alike to adapt.

### Analysis

${middle}

Yeh rahe main points:
1. **High Public Engagement:** Sirf journalists nahi — aam aadmi bhi. Iss type ki organic buzz ko fake nahi kiya ja sakta, aur yeh usually ek real shift ka sign hota hai.
2. **Timing ajeeb hai (ya perfect, yeh depend karta hai aap kis side ho):** Agle kuch hafton mein hum ripple effects dekh sakte hain — consumer habits, public sentiment, ya policy tweaks mein bhi.
3. **Genuine confusion aur curiosity dono mix hain:** Kisi bhi post ke comments padho, do raayen milengi: kuch log bol rahe hain overblown hai, kuch keh rahe hain bahut pehle hona chahiye tha.

> "Main ${category} developments ko kaafi time se track kar raha hoon, aur honestly, yeh ek alag hi feel deta hai. Public reaction aapne aap mein bahut kuch bata deta hai."

### Key Takeaways
- Event ne digital platforms par bahut bada discussion start kar dia hai.
- Yeh modern Indian audience ke evolving taste aur awareness ko show karta hai.
- Iske strategic implications kaafi wide hain, jo consumer behavior aur institutional rules ko impact karenge.
- Aane wale dino mein hum key bodies aur personalities se aur updates expect kar सकते hain.

### Conclusion

${closing}

*Aapko kya lagta hai? Yeh story evolve ho rahi hai, aur hum aapki raay bhi sunna chahenge.*

### Trending SEO Keywords
- ${keyword1} India
- ${title.split(" ").slice(0, 2).join(" ")}
- ${category} trends 2026
- India ${keyword2} news
- ${keyword1} ${keyword3} updates`;
}
