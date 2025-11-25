
import { GoogleGenAI, Type } from "@google/genai";
import { ChartData, ChartType } from '../types';

const API_KEY = (import.meta.env as any).VITE_GEMINI_API_KEY || (import.meta.env as any).VITE_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: API_KEY! });

if (!API_KEY) {

  console.warn("Gemini API key not found. Set VITE_GEMINI_API_KEY in your .env.local for local development.");

}

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

export const generateAnalysis = async (data: ChartData, type: ChartType) => {
  try {
    const isScatter = type === ChartType.SCATTER;
    
    // We now stringify the entire 'data' object, which includes 'points', 'xAxisLabel', and 'yAxisLabel'.
    // This provides the AI with the axis names directly inside the JSON structure.
    const prompt = `Analyze the following dataset for a ${isScatter ? 'Scatter Plot' : type + ' Bar Chart'}. 
    
    The dataset JSON below includes the axis labels ('xAxisLabel' and 'yAxisLabel') and the data points. 
    The X-axis represents "${data.xAxisLabel}" and the Y-axis represents "${data.yAxisLabel}".
    
    Please generate a suitable title and a business-style description of the patterns found in this data.

    Dataset:
    ${JSON.stringify(data, null, 2)}`;


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
