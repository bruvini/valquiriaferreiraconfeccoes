import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PagamentoAjudante } from '@/types';

export function usePagamentos() {
  const [pagamentos, setPagamentos] = useState<PagamentoAjudante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'pagamentos_ajudantes'), orderBy('data_trabalho', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PagamentoAjudante[];
        setPagamentos(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching pagamentos:', err);
        setError('Erro ao carregar pagamentos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addPagamento = async (pagamento: Omit<PagamentoAjudante, 'id'>) => {
    try {
      await addDoc(collection(db, 'pagamentos_ajudantes'), pagamento);
    } catch (err) {
      console.error('Error adding pagamento:', err);
      throw new Error('Erro ao adicionar pagamento');
    }
  };

  const deletePagamento = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pagamentos_ajudantes', id));
    } catch (err) {
      console.error('Error deleting pagamento:', err);
      throw new Error('Erro ao excluir pagamento');
    }
  };

  const totalDespesas = pagamentos.reduce((acc, p) => acc + p.valor_pago, 0);

  return {
    pagamentos,
    loading,
    error,
    addPagamento,
    deletePagamento,
    totalDespesas,
  };
}
