import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ParsedService {
  numero_op: string | null;
  fornecedor: string | null;
  cliente: string | null;
  tipo_peca: string | null;
  tipo_tecido: string | null;
  observacoes: string | null;
  // Updated to match new structure
  tamanhos: Record<string, number> | null;
  quantidade: number | null;
  preco_unitario: number | null;
}

export function useVoiceAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processTranscript = async (transcript: string): Promise<ParsedService | null> => {
    setIsProcessing(true);
    setError(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('API Key missing. Make sure VITE_GEMINI_API_KEY is set in .env');
      setError('Chave de API do Gemini não configurada.');
      return null;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Analise o texto e extraia um JSON estrito com as chaves:
      - numero_op (string, procure por "ordem de produção X", "OP X", "número X"),
      - cliente (string),
      - fornecedor (string),
      - tipo_peca (string),
      - tipo_tecido (string),
      - tamanhos (objeto JSON onde a chave é a sigla do tamanho padronizada para PP, P, M, G, GG, EXG e o valor é a quantidade number. Exemplo: { "P": 2, "M": 5 }),
      - quantidade (number total),
      - preco_unitario (number),
      - observacoes (string).

      Texto: "${transcript}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(cleanedText) as ParsedService;
      return parsed;

    } catch (err) {
      console.error('Erro bruto da IA:', err);
      setError('Erro ao processar o áudio com IA.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    processTranscript,
  };
}
