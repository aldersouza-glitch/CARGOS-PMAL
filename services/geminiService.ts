
import { GoogleGenAI } from "@google/genai";
import { OfficerData } from "../types";

export const analyzeWorkforce = async (data: OfficerData[]): Promise<string> => {
  // Always initialize GoogleGenAI with a named parameter for apiKey.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise os seguintes dados do efetivo da Polícia Militar de Alagoas (PMAL) e forneça insights estratégicos:
    ${JSON.stringify(data)}
    
    Considere:
    - Cargos ocupados vs Previstos.
    - Vacâncias críticas.
    - Oficiais em excesso (acima do posto) e o impacto na folha ou progressão.
    - Sugestões de concursos ou promoções baseadas nos quadros de acesso.
    
    Responda em Português com tom profissional e militar. Use Markdown para formatação.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Accessing the .text property directly from GenerateContentResponse
    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao conectar com a inteligência artificial.";
  }
};
