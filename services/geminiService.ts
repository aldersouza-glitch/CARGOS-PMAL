
import { GoogleGenAI } from "@google/genai";
import { OfficerData } from "../types";

export const analyzeWorkforce = async (data: OfficerData[]): Promise<string> => {
  // Acesso seguro à variável de ambiente injetada
  const apiKey = (process.env as any).API_KEY;
  
  if (!apiKey) {
    return "Configuração pendente: API Key não encontrada.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analise os seguintes dados do efetivo da Polícia Militar de Alagoas (PMAL) e forneça insights estratégicos:
    ${JSON.stringify(data)}
    
    Considere:
    - Cargos ocupados vs Previstos.
    - Vacâncias críticas.
    - Oficiais um posto acima (impacto na progressão).
    
    Responda em Português com tom profissional e militar. Use Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Análise concluída sem observações específicas.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O sistema de IA está temporariamente indisponível.";
  }
};
