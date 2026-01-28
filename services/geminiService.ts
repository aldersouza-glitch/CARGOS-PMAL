
import { GoogleGenAI } from "@google/genai";
import { OfficerData } from "../types";

export const analyzeWorkforce = async (data: OfficerData[]): Promise<string> => {
  // Fix: Access process.env.API_KEY directly as required by the guidelines
  if (!process.env.API_KEY) {
    return "Nota: Configure a API_KEY para habilitar análises automáticas.";
  }

  try {
    // Fix: Use correct initialization pattern for GoogleGenAI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analise os dados do efetivo da PMAL: ${JSON.stringify(data)}. Forneça um breve parecer estratégico militar.`;

    // Fix: Call generateContent with both model and prompt in a single call
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    // Fix: Use response.text property (getter) as per latest SDK specs
    return response.text || "Análise indisponível no momento.";
  } catch (error) {
    console.error("Erro na análise IA:", error);
    return "Ocorreu um erro ao processar a análise estratégica.";
  }
};
