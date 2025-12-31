import { Timestamp } from 'firebase/firestore';

export interface Servico {
  id?: string;
  fornecedor: string;
  tipo_peca: string;
  detalhe_tamanhos: string;
  quantidade_total: number;
  valor_unitario: number;
  valor_total_lote: number;
  data_entrada: Timestamp;
  status: 'Pendente' | 'Em Produção' | 'Entregue/Faturado';
}

export interface PagamentoAjudante {
  id?: string;
  nome_ajudante: string;
  data_trabalho: Timestamp;
  valor_pago: number;
}

export type StatusServico = 'Pendente' | 'Em Produção' | 'Entregue/Faturado';
