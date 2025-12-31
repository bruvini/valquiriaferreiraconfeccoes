import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Servico, StatusServico } from '@/types';

export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'servicos'), orderBy('data_entrada', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Servico[];
        setServicos(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching servicos:', err);
        setError('Erro ao carregar serviços');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addServico = async (servico: Omit<Servico, 'id' | 'data_entrada' | 'valor_total_lote'>) => {
    try {
      const valor_total_lote = servico.quantidade_total * servico.valor_unitario;
      await addDoc(collection(db, 'servicos'), {
        ...servico,
        valor_total_lote,
        data_entrada: Timestamp.now(),
        // Ensure defaults for new fields if not provided (though optional in type)
        status: 'PENDENTE',
      });
    } catch (err) {
      console.error('Error adding servico:', err);
      throw new Error('Erro ao adicionar serviço');
    }
  };

  const updateServicoStatus = async (id: string, status: StatusServico) => {
    try {
      const updateData: any = { status };

      if (status === 'EM_ANDAMENTO') {
        updateData.data_inicio = Timestamp.now();
      } else if (status === 'CONCLUIDO') {
        updateData.data_conclusao = Timestamp.now();
      }

      await updateDoc(doc(db, 'servicos', id), updateData);
    } catch (err) {
      console.error('Error updating servico:', err);
      throw new Error('Erro ao atualizar serviço');
    }
  };

  const deleteServico = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'servicos', id));
    } catch (err) {
      console.error('Error deleting servico:', err);
      throw new Error('Erro ao excluir serviço');
    }
  };

  // Cálculos para o Dashboard
  const totalAReceber = servicos
    .filter(s => s.status !== 'CONCLUIDO')
    .reduce((acc, s) => acc + s.valor_total_lote, 0);

  const producaoTotal = servicos.reduce((acc, s) => acc + s.valor_total_lote, 0);

  return {
    servicos,
    loading,
    error,
    addServico,
    updateServicoStatus,
    deleteServico,
    totalAReceber,
    producaoTotal,
  };
}
