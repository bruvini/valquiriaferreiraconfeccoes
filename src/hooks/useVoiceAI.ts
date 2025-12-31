import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ParsedService {
  numero_op: string | null;
  fornecedor: string | null;
  cliente: string | null;
  tipo_peca: string | null;
  tipo_tecido: string | null;
  observacoes: string | null;
  tamanhos: string | null;
  quantidade: number | null;
  preco_unitario: number | null;
}

export function useVoiceAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processTranscript = async (transcript: string): Promise<ParsedService | null> => {
    setIsProcessing(true);
    setError(null);

    // Hardcoded API key for testing environment as requested
    const apiKey = "AIzaSyAThGsUbxHVPIKnEFlCacARZkQtrJnOsVE";

    if (!apiKey) {
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
      - tamanhos (string ex: '2 P, 3 M'),
      - quantidade (number total),
      - preco_unitario (number),
      - observacoes (string).

      Texto: "${transcript}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const parsed = JSON.parse(text) as ParsedService;
      return parsed;

    } catch (err) {
      console.error('Error processing with Gemini:', err);
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
