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
  status: 'Pendente' | 'Em Produção' | 'Entregue/Faturado';
  observacoes?: string;
}

export interface PagamentoAjudante {
  id?: string;
  nome_ajudante: string;
  data_trabalho: Timestamp;
  valor_pago: number;
}

export type StatusServico = 'Pendente' | 'Em Produção' | 'Entregue/Faturado';
