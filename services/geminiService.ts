
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function summarizeDocument(docTitle: string, docDescription: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres un consultor de compliance retail en Argentina. 
      Resume de forma ejecutiva los puntos clave de la siguiente norma interna:
      Título: ${docTitle}
      Descripción: ${docDescription}
      
      El resumen debe ser directo, en bullet points, enfocado en lo que el empleado DEBE saber.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing document:", error);
    return "No se pudo generar el resumen inteligente.";
  }
}

export async function smartSearch(query: string, availableDocs: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Basado en el siguiente listado de documentos: ${availableDocs}. 
      ¿Cuáles son los más relevantes para la consulta: "${query}"? 
      Responde SOLO con un array JSON de IDs de documentos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error in smart search:", error);
    return [];
  }
}
