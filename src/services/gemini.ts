import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getAI() {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async generateResponse(prompt: string, history: Message[] = []) {
    const ai = this.getAI();
    const model = "gemini-3-flash-preview";
    
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    return this.withRetry(() => ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: "You are Xilight, a sophisticated AI assistant created by limezx. You are helpful, creative, and precise. Use markdown for formatting. If you use tools, explain what you are doing. If asked about your creator, you must state that you were created by limezx.",
        tools: [{ googleSearch: {} }]
      }
    }), 4, 1500);
  }

  async *streamResponse(prompt: string, history: Message[] = []) {
    const ai = this.getAI();
    const model = "gemini-3-flash-preview";
    
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: "You are Xilight, a sophisticated AI assistant created by limezx. You are helpful, creative, and precise. Use markdown for formatting. If you use tools, explain what you are doing. If asked about your creator, you must state that you were created by limezx.",
        tools: [{ googleSearch: {} }]
      },
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    });

    const result = await this.withRetry(() => chat.sendMessageStream({ message: prompt }), 4, 1500);
    
    for await (const chunk of result) {
      yield (chunk as GenerateContentResponse).text;
    }
  }
}

export const gemini = new GeminiService();
