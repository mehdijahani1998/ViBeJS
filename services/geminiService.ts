
import { GoogleGenAI, Type } from "@google/genai";
import { ChartDataItem, ChartType } from '../types';

// Read the Gemini API key from Vite environment variables.
// Vite only exposes env vars prefixed with `VITE_` to the client bundle.
// We also check `VITE_API_KEY` as a common alternative.
const API_KEY = (import.meta.env as any).VITE_GEMINI_API_KEY || (import.meta.env as any).VITE_API_KEY || "";

if (!API_KEY) {
  // Warn at runtime so developers know to add `.env.local` with the key.
  // Do not include secrets in source control; use `.env.local` which is typically gitignored.
  console.warn("Gemini API key not found. Set VITE_GEMINI_API_KEY in your .env.local for local development.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A creative and descriptive title for a chart with this data, under 10 words.",
    },
    description: {
      type: Type.STRING,
      description: "A one-paragraph summary or analysis of what this data could represent, as if for a business report.",
    },
  },
  required: ['title', 'description'],
};

export const generateAnalysis = async (data: ChartDataItem[], type: ChartType) => {
  try {
    const prompt = `
      Analyze the following dataset for a ${type} bar chart and generate a suitable title and description.
      The data represents user-drawn values for a set of labels.
      Dataset:
      ${JSON.stringify(data, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("Error generating analysis with Gemini:", error);
    return {
      title: "Analysis Failed",
      description: "Could not generate an AI analysis for this dataset. Please try again later.",
    };
  }
};
