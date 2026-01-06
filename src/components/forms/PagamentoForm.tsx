import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePagamentos } from '@/hooks/usePagamentos';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { UserPlus } from 'lucide-react';
import { parseDateToNoon } from '@/lib/utils';

export function PagamentoForm() {
  const [nomeAjudante, setNomeAjudante] = useState('');
  const [dataTrabalho, setDataTrabalho] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [loading, setLoading] = useState(false);

  const { addPagamento } = usePagamentos();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomeAjudante || !dataTrabalho || !valorPago) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const valorNum = parseFloat(valorPago.replace(',', '.')) || 0;

    setLoading(true);
    try {
      await addPagamento({
        nome_ajudante: nomeAjudante,
        data_trabalho: Timestamp.fromDate(parseDateToNoon(dataTrabalho)),
        valor_pago: valorNum,
      });
      
      toast({
        title: "Pagamento registrado!",
        description: `${nomeAjudante} - R$ ${valorNum.toFixed(2).replace('.', ',')}`,
      });
      
      setNomeAjudante('');
      setDataTrabalho('');
      setValorPago('');
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-base font-medium text-copper">
          Quem trabalhou?
        </Label>
        <Input
          id="nome"
          placeholder="Nome da ajudante"
          value={nomeAjudante}
          onChange={(e) => setNomeAjudante(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="data" className="text-base font-medium text-copper">
          Qual dia?
        </Label>
        <Input
          id="data"
          type="date"
          value={dataTrabalho}
          onChange={(e) => setDataTrabalho(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="valorPago" className="text-base font-medium text-copper">
          Valor pago (R$)
        </Label>
        <Input
          id="valorPago"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={valorPago}
          onChange={(e) => setValorPago(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="copper"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        <UserPlus className="w-5 h-5" />
        {loading ? 'Salvando...' : 'Registrar Pagamento'}
      </Button>
    </form>
  );
}
