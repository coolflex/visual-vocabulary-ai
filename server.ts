import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON limit to handle base64 image uploads
app.use(express.json({ limit: '12mb' }));

// Lazy initializer for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Simulated AI answers will be returned.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "simulated-key",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Check if Gemini API key is active
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY
  });
});

// AI Chatbot with context
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, selectedWord, details } = req.body;
    
    // If no key is configured, fallback to friendly interactive mockup responses
    if (!process.env.GEMINI_API_KEY) {
      const lastMsg = messages[messages.length - 1]?.text || "";
      const lower = lastMsg.toLowerCase();
      let reply = `Great question! As your AI tutor, I see you are learning about ${selectedWord || "visual terms"}. `;
      if (selectedWord) {
        reply += `The word **${selectedWord}** is exceptionally useful. It refers to ${details?.meaning || "this item"}.\n\nAn example of how to use it is: *"${details?.example || "Look at this item carefully."}"*\n\nDid you also know that in Spanish it represents *"${details?.translations?.es?.word || ""}"*? Let me know if you would like me to translate it to any other language or explain its origins!`;
      } else {
        reply += "I can help you explore any object on your screen, teach you its correct spelling, pronunciation keys (IPA), or usage. Click on any item or scan a picture to begin!";
      }
      return res.json({ text: reply });
    }

    const ai = getAI();
    let prompt = `You are a friendly, encouraging AI Language Tutor called "VocabAI Coach". You teach vocabulary using visual references, memory tricks, matching quizzes, and comparative linguistics.\n\n`;
    
    if (selectedWord) {
      prompt += `The student is currently looking at the word: "${selectedWord}".\nDetails: "${details?.meaning || ""}".\nExample: "${details?.example || ""}"\n\n`;
    }
    
    prompt += `Conversation History:\n`;
    messages.forEach((m: any) => {
      prompt += `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}\n`;
    });
    
    prompt += `\nTutor (provide a warm, concise, educational response, using markdown bold accents for key vocabulary):`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional visual linguist and Duolingo-style coach. Respond in a highly engaging, concise, and structured way with friendly notes.",
      }
    });

    res.json({ text: response.text || "I apologize, but I didn't catch that. Could you try asking again?" });

  } catch (error: any) {
    console.error("Express /api/chat error:", error);
    res.status(500).json({ error: "Failed to generate AI tutoring response. " + error.message });
  }
});

// AI Scan Image to retrieve Hotspots & Translations
app.post("/api/scan", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Please provide imageBase64 in the payload." });
    }

    // Fallback if no API key is specified (simulated object scanner output)
    if (!process.env.GEMINI_API_KEY) {
      console.log("No GEMINI_API_KEY. Using mock item scanning output.");
      const mockResult = [
        {
          word: "Computer Laptop",
          ipa: "/kəmˈpjuː.tər/",
          meaning: "A portable computer suitable for mobile use, running on battery or main currents.",
          example: "He programmed the entire visual vocabulary applet on his high-performance laptop.",
          x: 50,
          y: 65,
          translations: {
            ar: { word: "كمبيوتر محمول", meaning: "جهاز كمبيوتر محمول مناسب للاستخدام الشخصي والدراسة والبرمجة.", example: "برمج التطبيق بالكامل على حاسوبه المحمول." },
            fr: { word: "Ordinateur portable", meaning: "Un ordinateur personnel conçu pour être facilement transporté.", example: "Il a programmé l'application sur son ordinateur portable." },
            es: { word: "Computadora portátil", meaning: "Un ordenador personal eléctrico y móvil con batería.", example: "Programó toda la aplicación en su portátil de alto rendimiento." },
            de: { word: "Laptop", meaning: "Ein tragbarer Computer zur mobilen Nutzung mit Akku.", example: "Er hat die gesamte App auf seinem Laptop programmiert." },
            ja: { word: "ノートパソコン", meaning: "持ち運びが簡単な個人用コンピューター。", example: "彼は高性能ノートパソコンでアプリ全体をプログラミングした。" },
            ko: { word: "노트북", meaning: "들고 다닐 수 있는 휴대용 소형 컴퓨터.", example: "그는 고성능 노트북으로 전체 앱을 만들었다." }
          }
        },
        {
          word: "Coffee Mug",
          ipa: /ˈkɔː.fi mʌɡ/,
          meaning: "A heavy, cylindrical ceramic cup with a side handle used for hot liquids.",
          example: "She took a sip of hot chocolate from the warm ceramic coffee mug.",
          x: 25,
          y: 78,
          translations: {
            ar: { word: "كوب قهوة", meaning: "كوب سيراميك ثقيل بمقبض جانبي للسوائل الساخنة كالقهوة والشاي والكاكاو.", example: "رشفت رشفة من الشوكولاتة الساخنة من كوب القهوة الدافئ." },
            fr: { word: "Tasse à café", meaning: "Récipient cylindrique avec anse pour servir le café chaud.", example: "Elle a bu une gorgée de chocolat de sa grande tasse." },
            es: { word: "Taza de café", meaning: "Recipiente cilíndrico con asa para bebidas calientes.", example: "Tomó un sorbo de chocolate caliente de la taza." },
            de: { word: "Kaffeetasse", meaning: "Ein zylindrischer Keramikbecher mit Henkel für heiße Getränke.", example: "Sie trank heißen Kakao aus der warmen Tasse." },
            ja: { word: "コーヒーマグ", meaning: "温かい飲み物用に使われる、側面に取っ手の付いた重い円筒形の陶器製コップ。", example: "彼女は温かいコーヒーマグからココアを一口すすった。" },
            ko: { word: "머그잔", meaning: "따뜻한 음료를 마실 때 쓰는 옆에 손잡이가 달린 원통형 도자기 컵.", example: "그녀는 따뜻한 머그잔에 담긴 핫초코를 한 모금 마셨다." }
          }
        }
      ];
      return res.json({ items: mockResult, simulated: true });
    }

    const ai = getAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanBase64
          }
        },
        {
          text: `You are an advanced educational image scanner. Detect up to 6 most prominent and educational objects or features visible in this photo.
For each detected object, output a JSON structure with exact keys:
1. word: Singular English title (e.g. "Toaster", "Backpack").
2. ipa: International Phonetic Alphabet string.
3. meaning: A clear, simple dictionary definition suitable for dictionary study.
4. example: A sample sentence.
5. x: Approximate horizontal coordinate (integer between 15 and 85) specifying where this object is centered on the image.
6. y: Approximate vertical coordinate (integer between 15 and 85).
7. translations: A map of language codes ('ar', 'fr', 'es', 'de', 'ja', 'ko') containing translated keys 'word', 'meaning', and 'example' for that idiom.

Ensure that the coordinates (x, y) represent actual offsets within the image. Make sure the output is strict, valid JSON matching the schema.`
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              ipa: { type: Type.STRING },
              meaning: { type: Type.STRING },
              example: { type: Type.STRING },
              x: { type: Type.INTEGER },
              y: { type: Type.INTEGER },
              translations: {
                type: Type.OBJECT,
                properties: {
                  ar: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING }, example: { type: Type.STRING } }
                  },
                  fr: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING }, example: { type: Type.STRING } }
                  },
                  es: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING }, example: { type: Type.STRING } }
                  },
                  de: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING }, example: { type: Type.STRING } }
                  },
                  ja: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING }, example: { type: Type.STRING } }
                  },
                  ko: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING }, example: { type: Type.STRING } }
                  }
                }
              }
            },
            required: ["word", "ipa", "meaning", "example", "x", "y", "translations"]
          }
        }
      }
    });

    const parsedText = response.text;
    console.log("Gemini Object detection coordinates:", parsedText);
    const resultObj = JSON.parse(parsedText || "[]");
    res.json({ items: resultObj, simulated: false });

  } catch (error: any) {
    console.error("Express /api/scan error:", error);
    res.status(500).json({ error: "Failed to scan image using Gemini. Details: " + error.message });
  }
});

// Configure Vite or Serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();
