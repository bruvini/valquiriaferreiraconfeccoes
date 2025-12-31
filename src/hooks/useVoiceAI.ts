import { useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ParsedService {
  fornecedor: string | null;
  cliente: string | null;
  tipo_peca: string | null;
  tipo_tecido: string | null;
  observacoes: string | null;
  tamanhos: Array<{ tamanho: string; quantidade: number }> | null;
  preco_unitario: number | null;
}

export function useVoiceAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findSimilarName = async (name: string, existingNames: string[]): Promise<string> => {
    if (!name) return name;
    
    const normalizedInput = name.toLowerCase().trim();
    
    for (const existing of existingNames) {
      const normalizedExisting = existing.toLowerCase().trim();
      
      // Check for exact match
      if (normalizedInput === normalizedExisting) {
        return existing;
      }
      
      // Check if one contains the other
      if (normalizedInput.includes(normalizedExisting) || normalizedExisting.includes(normalizedInput)) {
        return existing;
      }
      
      // Calculate simple similarity (words in common)
      const inputWords = normalizedInput.split(/\s+/);
      const existingWords = normalizedExisting.split(/\s+/);
      const commonWords = inputWords.filter(w => existingWords.some(ew => ew.includes(w) || w.includes(ew)));
      
      if (commonWords.length >= Math.min(inputWords.length, existingWords.length) * 0.6) {
        return existing;
      }
    }
    
    return name;
  };

  const getExistingNames = async (): Promise<{ fornecedores: string[]; clientes: string[] }> => {
    try {
      const q = query(collection(db, 'servicos'));
      const snapshot = await getDocs(q);
      
      const fornecedores = new Set<string>();
      const clientes = new Set<string>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.fornecedor) fornecedores.add(data.fornecedor);
        if (data.cliente) clientes.add(data.cliente);
      });
      
      return {
        fornecedores: Array.from(fornecedores),
        clientes: Array.from(clientes),
      };
    } catch (err) {
      console.error('Error fetching existing names:', err);
      return { fornecedores: [], clientes: [] };
    }
  };

  const processTranscript = async (transcript: string, apiKey: string): Promise<ParsedService | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Você é um assistente de confecção. Analise o texto falado e extraia informações sobre um serviço de costura. 
              
Retorne APENAS um JSON válido (sem markdown, sem \`\`\`) com as seguintes chaves:
- fornecedor: nome da empresa/fornecedor (string ou null)
- cliente: nome do cliente final (string ou null)
- tipo_peca: tipo da roupa/peça (string ou null, ex: "Camisa Polo", "Jaleco", "Uniforme")
- tipo_tecido: tipo do tecido (string ou null, ex: "Jeans", "Malha", "Oxford")
- observacoes: qualquer observação adicional (string ou null)
- tamanhos: array de objetos {tamanho: string, quantidade: number} ou null. Padronize tamanhos para: PP, P, M, G, GG, XGG
- preco_unitario: valor por peça em número (number ou null, apenas o número sem R$)

Se o usuário não mencionar algo, coloque null.
Corrija possíveis erros de transcrição em nomes próprios baseado no contexto.`
            },
            {
              role: 'user',
              content: transcript
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro na API da OpenAI');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      // Parse JSON from response (clean any markdown if present)
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```json?\n?/g, '').replace(/```$/g, '');
      }

      const parsed: ParsedService = JSON.parse(cleanedContent);

      // Deduplicate names using existing database entries
      const existingNames = await getExistingNames();
      
      if (parsed.fornecedor) {
        parsed.fornecedor = await findSimilarName(parsed.fornecedor, existingNames.fornecedores);
      }
      
      if (parsed.cliente) {
        parsed.cliente = await findSimilarName(parsed.cliente, existingNames.clientes);
      }

      return parsed;
    } catch (err) {
      console.error('Error processing transcript:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar com IA');
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
