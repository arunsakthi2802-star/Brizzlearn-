import { GoogleGenAI, Type } from "@google/genai";

const RECOMMENDATION_MODEL = 'gemini-3-flash-preview';

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

// Concurrency Limiter: Prevent more than 2 parallel AI requests
class AIQueue {
  private activeCount = 0;
  private maxConcurrency = 2;
  private queue: (() => void)[] = [];

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.maxConcurrency) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    this.activeCount++;
    try {
      return await task();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
}

const aiQueue = new AIQueue();

// Enhanced retry logic with exponential backoff for rate limiting
async function retryRequest<T>(requestFn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await aiQueue.run(requestFn);
    } catch (error: any) {
      lastError = error;
      const status = error?.status;
      const errorMsg = error?.message || "";
      
      // If rate limited (429) or server error (500, 503)
      if (status === 429 || errorMsg.includes('429') || errorMsg.includes('503') || errorMsg.includes('500')) {
        // More aggressive exponential backoff: 3s, 9s, 27s... + random jitter
        const backoffTime = Math.pow(3, i + 1) * 1000 + Math.random() * 2000;
        console.warn(`Rate limit (429) hit. Waiting ${Math.round(backoffTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await wait(backoffTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Simple Session Caching Utility
const getCached = (key: string) => {
  const cached = sessionStorage.getItem(key);
  if (!cached) return null;
  const { data, expiry } = JSON.parse(cached);
  if (Date.now() > expiry) {
    sessionStorage.removeItem(key);
    return null;
  }
  return data;
};

const setCache = (key: string, data: any, ttlMs: number = 600000) => { // Default 10 mins
  sessionStorage.setItem(key, JSON.stringify({ data, expiry: Date.now() + ttlMs }));
};

const getCleanText = (response: any): string => {
  let text = response.text || "";
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const getMotivationQuote = async (language: string) => {
  const cacheKey = `motivation_${language}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Generate a single short powerful motivational sentence for a tech learner in ${language}. Use emojis.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    const quote = getCleanText(response);
    setCache(cacheKey, quote, 86400000); // Cache for 24 hours
    return quote;
  });
};

export const searchJobsAI = async (criteria: { role: string; location: string; experience: string; skills: string[] }) => {
  const cacheKey = `jobs_${criteria.role}_${criteria.location}_${criteria.experience}_${criteria.skills.sort().join('_')}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Find 10 active job/internship opportunities matching: Role: ${criteria.role}, Location: ${criteria.location}, Experience: ${criteria.experience}, Skills: ${criteria.skills.join(', ')}. Return raw JSON only.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['job', 'internship'] },
              description: { type: Type.STRING },
              eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
              applyUrl: { type: Type.STRING }
            }
          }
        }
      }
    });
    const result = JSON.parse(getCleanText(response));
    setCache(cacheKey, result, 1800000); // 30 mins
    return result;
  });
};

export const getAptitudeQuiz = async (category: string) => {
  const cacheKey = `quiz_${category}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Generate 10 aptitude questions for ${category}. Return raw JSON only.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING }
            }
          }
        }
      }
    });
    const result = JSON.parse(getCleanText(response));
    setCache(cacheKey, result, 3600000); // 1 hour
    return result;
  });
};

export const getProblemSolvingSet = async (domain: string) => {
  const cacheKey = `problems_${domain}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Create 5 specialized coding/DSA problems for ${domain}. Return raw JSON only.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
              description: { type: Type.STRING },
              starterCode: { type: Type.STRING },
              testCases: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });
    const result = JSON.parse(getCleanText(response));
    setCache(cacheKey, result, 3600000); // 1 hour
    return result;
  });
};

export const getMarketPulseNews = async (interest: string = 'Technology') => {
  const cacheKey = `news_${interest}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Search for exactly 10 latest tech news for ${interest}. Return raw JSON only.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              tag: { type: Type.STRING },
              date: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING }
            }
          }
        }
      }
    });
    const news = JSON.parse(getCleanText(response));
    setCache(cacheKey, news, 1800000); // Cache news for 30 minutes
    return news;
  });
};

export const getProjectRoadmap = async (projectName: string) => {
  const cacheKey = `roadmap_${projectName}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Develop a full project roadmap for "${projectName}". Return raw JSON only.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tech: { type: Type.ARRAY, items: { type: Type.STRING } },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  details: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    const result = JSON.parse(getCleanText(response));
    setCache(cacheKey, result, 86400000); // 24 hours
    return result;
  });
};

export const getLocalizedResources = async (topic: string, language: string, count: number = 10) => {
  const cacheKey = `resources_${topic}_${language}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Search for ${count} learning resources about ${topic} in ${language}. Return raw JSON only.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['youtube', 'pdf', 'course'] },
              category: { type: Type.STRING, enum: ['free', 'paid'] },
              title: { type: Type.STRING },
              provider: { type: Type.STRING },
              url: { type: Type.STRING }
            }
          }
        }
      }
    });
    const result = JSON.parse(getCleanText(response));
    setCache(cacheKey, result, 3600000); // 1 hour
    return result;
  });
};

export const getSageChatResponse = async (history: any[], userMessage: string, language: string) => {
  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({ 
      model: RECOMMENDATION_MODEL,
      history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: `You are SAGE. Provide expert career advice in ${language}. Be concise.`
      }
    });
    const response = await chat.sendMessage({ message: userMessage });
    return getCleanText(response);
  });
};

export const getMockInterviewResponse = async (history: any[], userMessage: string) => {
  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({ 
      model: RECOMMENDATION_MODEL,
      history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a technical diagnostic AI. Evaluate the user's answer."
      }
    });
    const response = await chat.sendMessage({ message: userMessage });
    return getCleanText(response);
  });
};

export const getCareerRecommendations = async (skills: string[], language: string) => {
  const cacheKey = `career_${skills.sort().join('_')}_${language}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Recommend career paths for: ${skills.join(', ')} in ${language}. Return raw JSON only.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pathId: { type: Type.STRING },
              title: { type: Type.STRING },
              reason: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              starterGuide: { type: Type.STRING },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    proTips: { type: Type.STRING },
                    resources: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          type: { type: Type.STRING },
                          category: { type: Type.STRING },
                          title: { type: Type.STRING },
                          provider: { type: Type.STRING },
                          url: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    const result = JSON.parse(getCleanText(response));
    setCache(cacheKey, result, 86400000); // 24 hours
    return result;
  });
};

export const getGeminiAdvice = async (goal: string, level: string) => {
  const cacheKey = `advice_${goal}_${level}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Brief tactical advice for: Goal: ${goal}, Level: ${level}.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    const advice = getCleanText(response);
    setCache(cacheKey, advice, 3600000); // 1 hour
    return advice;
  });
};

export const simulateCodeExecution = async (code: string, language: string) => {
  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Execute ${language} code and return raw result: ${code}`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return getCleanText(response);
  });
};

export const simulateTerminal = async (cmd: string, files: any[]) => {
  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Bash simulation for cmd "${cmd}" on files: ${JSON.stringify(files)}`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return getCleanText(response);
  });
};

export const getArchitectScript = async (projectTitle: string) => {
  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Architectural script for: ${projectTitle}.`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return getCleanText(response);
  });
};

export const suggestAlternativeVideos = async (topic: string, language: string) => {
  return retryRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: `Find alternative YouTube learning for: ${topic} in ${language}. Return raw JSON only.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['youtube'] },
              category: { type: Type.STRING, enum: ['free'] },
              title: { type: Type.STRING },
              provider: { type: Type.STRING },
              url: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(getCleanText(response));
  });
};