import { Timestamp } from 'firebase/firestore';

export interface Servico {
  id?: string;
  fornecedor: string;
  cliente?: string;
  tipo_peca: string;
  tipo_tecido?: string;
  // Changed from string to Record for granular stock control
  tamanhos: Record<string, number>;
  // Legacy support field (optional) - for old records if needed, but we will primarily use 'tamanhos' now
  detalhe_tamanhos?: string;

  quantidade_total: number;
  valor_unitario: number;
  valor_total_lote: number;
  data_entrada: Timestamp;

  numero_op?: string;
  data_chegada?: string;
  data_inicio?: Timestamp | null;
  data_conclusao?: Timestamp | null;
  foto_op_url?: string | null;

  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  observacoes?: string;
}

export interface PagamentoAjudante {
  id?: string;
  nome_ajudante: string;
  data_trabalho: Timestamp;
  valor_pago: number;
}

export type StatusServico = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';
