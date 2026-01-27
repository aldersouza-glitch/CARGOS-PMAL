
import { GoogleGenAI } from "@google/genai";
import { OfficerData } from "../types";

export const analyzeWorkforce = async (data: OfficerData[]): Promise<string> => {
  // Acesso seguro ao process.env injetado pelo ambiente
  const apiKey = (process.env as any).API_KEY;
  
  if (!apiKey) {
    return "Nota: Configure a API_KEY para habilitar análises automáticas.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analise os dados do efetivo da PMAL: ${JSON.stringify(data)}. Forneça um breve parecer estratégico militar.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Análise indisponível no momento.";
  } catch (error) {
    console.error("Erro na análise IA:", error);
    return "Ocorreu um erro ao processar a análise estratégica.";
  }
};
