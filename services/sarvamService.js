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
You are an expert Indian journalist and SEO specialist writing for NewsAdda.
Write a highly engaging, detailed, and SEO-optimized news blog article based on the following details:

Category: ${category}
Headline Title: ${title}
Short Summary: ${description}

${searchContext ? `Here is the real-time background search coverage we fetched for this headline. Use these actual facts, details, and context to enrich your article:\n\n${searchContext}\n` : ""}

CRITICAL INSTRUCTIONS FOR COMPLETENESS & SEO:
1. The article MUST be a thorough read of **at least 500 to 800 words** in total. It is CRITICAL that you budget your generation length to fully complete the entire article and do not get cut off. Ensure the article is fully written, concluded, and polished with a proper closing paragraph.
2. Format the entire article in clean, professional Markdown.
3. Use descriptive subheadings (###) to separate sections (e.g., Background/Core Dynamics, Key Details/Analysis, and Future Outlook/Implications).
4. Use bold text, bullet points (1., *), and a high-quality blockquote (> ) to make the post highly readable and engaging.
5. Identify 4-6 highly relevant, trending SEO keywords based on the headline and search context. Integrate these keywords naturally with high density throughout the text to boost trending rank.
6. Add a list of "Trending SEO Keywords" in a clean bulleted list at the very bottom of the post.
7. Do NOT include the main title or the category as a header in your output. Start directly with the introduction.
8. Write in an authoritative, analytical, and gripping tone tailored for Indian and global readers.
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
आप NewsAdda के लिए एक विशेषज्ञ भारतीय पत्रकार और SEO विशेषज्ञ हैं।
नीचे दिए गए विवरण के आधार पर एक अत्यधिक आकर्षक, विस्तृत और SEO-अनुकूलित समाचार ब्लॉग लेख हिंदी में लिखें।

श्रेणी: ${category}
शीर्षक: ${title}
संक्षिप्त सारांश: ${description}

${searchContext ? `यहां वास्तविक समय की पृष्ठभूमि खोज कवरेज है जो हमने इस शीर्षक के लिए प्राप्त की है। इन वास्तविक तथ्यों, विवरणों और संदर्भ का उपयोग अपने लेख को समृद्ध करने के लिए करें:\n\n${searchContext}\n` : ""}

पूर्णता और SEO के लिए महत्वपूर्ण निर्देश:
1. लेख कुल मिलाकर **कम से कम 500 से 800 शब्दों** का होना चाहिए। यह महत्वपूर्ण है कि आप पीढ़ी की लंबाई को पूरी तरह से प्रबंधित करें और बीच में न रुकें। लेख को पूरी तरह से लिखें, निष्कर्ष निकालें, और एक उचित समापन पैराग्राफ के साथ पॉलिश करें।
2. पूरे लेख को साफ, पेशेवर Markdown में प्रारूपित करें।
3. वर्णनात्मक उप-शीर्षकों (###) का उपयोग करें जैसे पृष्ठभूमि/मुख्य गतिशीलता, मुख्य विवरण/विश्लेषण, और भविष्य की संभावनाएं/प्रभाव।
4. बोल्ड टेक्स्ट, बुलेट पॉइंट्स (1., *) और एक उच्च-गुणवत्ता वाला ब्लॉककोट (> ) का उपयोग करें ताकि पोस्ट अत्यधिक पठनीय और आकर्षक हो।
5. शीर्षक और खोज संदर्भ के आधार पर 4-6 अत्यधिक प्रासंगिक, ट्रेंडिंग SEO कीवर्ड पहचानें। इन कीवर्ड को प्राकृतिक रूप से पूरे टेक्स्ट में उच्च घनत्व के साथ एकीकृत करें।
6. पोस्ट के सबसे नीचे "ट्रेंडिंग SEO कीवर्ड" की एक साफ बुलleted सूची जोड़ें।
7. अपने आउटपुट में मुख्य शीर्षक या श्रेणी को हेडर के रूप में शामिल न करें। सीधे परिचय के साथ शुरू करें।
8. एक आधिकारिक, विश्लेषणात्मक और gripping स्वर में लिखें जो भारतीय और वैश्विक पाठकों के लिए उपयुक्त हो।
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
  const keyword2 = keywords[1] || "Trending";
  const keyword3 = keywords[2] || "Update";

  let contextSection = "";
  if (searchContext && searchContext.trim().length > 0) {
    contextSection = `### Real-Time Investigations & Search Analysis\n\nDeep-dive coverage across leading national news outlets offers valuable context on these events. Key details compiled from current reports reveal significant facets of this story:\n\n`;
    const items = searchContext.split("\n\n").filter((x) => x.includes("Title:"));
    items.forEach((item, idx) => {
      const lines = item.split("\n");
      const subTitle = lines[0].replace("[News Coverage #" + (idx + 1) + "] Title: ", "").replace("Title: ", "").trim();
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

// --- Hindi fallback ---
function generateHindiFallbackMarkdown(title, description, category, searchContext = "") {
  const cleanTitle = title.replace(/[^\w\s]/gi, "");
  const keywords = cleanTitle.split(/\s+/).filter((w) => w.length > 3);
  const keyword1 = keywords[0] || "भारत";
  const keyword2 = keywords[1] || "ट्रेंडिंग";
  const keyword3 = keywords[2] || "अपडेट";

  let contextSection = "";
  if (searchContext && searchContext.trim().length > 0) {
    contextSection = `### वास्तविक समय की जांच और खोज विश्लेषण\n\nप्रमुख राष्ट्रीय समाचार आउटलेट्स में गहन कवरेज इन घटनाक्रमों पर मूल्यवान संदर्भ प्रदान करता है। वर्तमान रिपोर्टों से संकलित मुख्य विवरण इस कहानी के महत्वपूर्ण पहलुओं को प्रकट करते हैं:\n\n`;
    const items = searchContext.split("\n\n").filter((x) => x.includes("Title:"));
    items.forEach((item, idx) => {
      const lines = item.split("\n");
      const subTitle = lines[0].replace("[News Coverage #" + (idx + 1) + "] Title: ", "").replace("Title: ", "").trim();
      const subDesc = lines[1].replace("Context: ", "").replace("Description: ", "").trim();
      contextSection += `#### ${idx + 1}. ${subTitle}\n${subDesc}\n\n`;
    });
  } else {
    contextSection = `### वास्तविक समय की जांच और खोज विश्लेषण\n\nवास्तविक समय में कोई द्वितीयक वेब खोज संदर्भ प्राप्त नहीं किया जा सका। हालांकि, फील्ड रिपोर्टों से संकेत मिलता है कि इस विकास पर जनता की प्रतिक्रिया बड़े पैमाने पर है। पर्यवेक्षकों का सुझाव है कि नियामक निकाय और नीति विशेषज्ञ वर्तमान में अद्यतन प्रतिक्रियाएं तैयार करने के लिए मानक दिशानिर्देशों की समीक्षा कर रहे हैं।\n\n`;
  }

  return `### व्यापक विश्लेषण: ${title}

**${title}** के बारे में नवीनतम अपडेट **${category}** में रुचि रखने वाले स्थानीय हितधारकों और पाठकों के लिए एक प्रमुख बदलाव का संकेत देता है। यह विकास—*"${description}"* के रूप में सारांशित—नए रुझानों और बदलते पैटर्न को उजागर करता है, जिससे तीव्र सार्वजनिक चर्चाएं और मीडिया कवरेज हुई है।

जैसे-जैसे हम ये प्रमुख बदलाव देखते हैं, विशेषज्ञ विश्लेषक संरचनात्मक कारकों को समझने के महत्व पर जोर देते हैं। चाहे व legislative नीतियों पर विचार करना हो, सामाजिक प्रभावों पर, या सांस्कृतिक बदलावों पर, स्थानीय संदर्भ अंतिम परिणाम को आकार देने में एक स्मारकीय भूमिका निभाता है।

${contextSection}
### मुख्य गतिशीलता और भारतीय संदर्भ

यह समझने के लिए कि यह देश भर में इतना महत्वपूर्ण चर्चा का विषय क्यों बन गया है, हमें उन प्रमुख कारकों को देखना होगा जो सार्वजनिक कथान को आकार दे रहे हैं:

1. **उच्च सार्वजनिक engagement:** इस विषय ने डिजिटल प्लेटफार्मों पर व्यापक बातचीत उत्पन्न की है, जो जनता की मजबूत रुचि को दर्शाती है। नागरिक पारदर्शिता और तत्काल कार्रवाई की मांग कर रहे हैं।
2. **गतिशील सांस्कृतिक बदलाव:** आधुनिक भारतीय दर्शक इन कहानियों को कैसे उपभोग करते हैं और उनसे जुड़ते हैं, यह सांस्कृतिक अपेक्षाओं और जागरूकता में तेज परिवर्तन दर्शाता है।
3. **सामाजिक-आर्थिक प्रासंगिकता:** यह trending headline के सीधे प्रभाव उपभोक्ता व्यवहारों, सामुदायिक दिशानिर्देशों, या संस्थागत प्रोटोकॉल पर पड़ते हैं, जिससे त्वरित अनुकूलन की आवश्यकता होती है।

> "यह trending कहानी भारत में ${category.toLowerCase()} विकास को कैसे interpret करते हैं, उसमें एक नए अध्याय का प्रतीक है। इसके प्रभाव का पैमाना विशाल है और यह दीर्घकालिक बदलाव का संकेत देता है।"

### रणनीतिक निहितार्थ और भविष्य की संभावनाएं

आगे बढ़ते हुए, व्यवसायों, सामग्री निर्माताओं और नीति समन्वयकों को इन अपडेट्स के अनुरूप अनुकूलित करना होगा। उदाहरण के लिए, इन हाइलाइट्स के आसप,targeted अभियान बनाकर प्रभावी रूप से organic search trends को कैpture किया जा सकता है। उच्च-गुणवत्ता वाली कवरेज बनाए रखना एक भीड़भाड़ वाले digital landscape में विश्वसनीयता और विश्वास सुनिश्चित करता है।

जैसे-जैसे स्थिति विकसित होती है, हम उद्योग प्रतिनिधियों और कानूनी अधिकारियों से आगे के बयानों और सार्वजनिक प्रतिक्रियाओं की उम्मीद करते हैं। इन बदलावों के लिए त्वरित रूप से अनुकूलित होने के लिए क्षेत्र में उभरती हुई प्रतिमानों की गहरी सराहना की आवश्यकता होती है।

हम इस लेख को अधिक जानकारी और विवरणों के साथ अद्यतित करते रहेंगे जैसे ही सक्रिय समन्वयकों द्वारा आधिकारिक रूप से जारी किए जाते हैं।

### ट्रेंडिंग SEO कीवर्ड:
* **${keyword1} भारत**
* **${title.split(" ").slice(0, 3).join(" ")}**
* **${category} trends 2026**
* **भारत ${keyword2} समाचार**
* **${keyword1} ${keyword3} अपडेट्स**`;
}
