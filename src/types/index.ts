import { Timestamp } from 'firebase/firestore';

export interface Servico {
  id?: string;
  fornecedor: string;
  cliente?: string;
  tipo_peca: string;
  tipo_tecido?: string;
  detalhe_tamanhos: string;
  quantidade_total: number;
  valor_unitario: number;
  valor_total_lote: number;
  data_entrada: Timestamp;
  // New fields
  numero_op?: string;
  data_chegada?: string; // Storing as string from date input (YYYY-MM-DD)
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
