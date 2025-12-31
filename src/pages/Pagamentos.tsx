import { PagamentoForm } from '@/components/forms/PagamentoForm';
import { PagamentosList } from '@/components/lists/PagamentosList';
import { usePagamentos } from '@/hooks/usePagamentos';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Pagamentos = () => {
  const navigate = useNavigate();
  const { totalDespesas } = usePagamentos();

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalDespesas);

  return (
    <div className="pb-24 w-full max-w-full px-4 overflow-x-hidden">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Pagamentos
          </h2>
          <p className="text-muted-foreground text-sm">
            Diárias das ajudantes
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-copper">{formattedTotal}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-copper" />
          <h3 className="font-semibold text-foreground">Novo Pagamento</h3>
        </div>
        <PagamentoForm />
      </div>

      <Separator className="my-6" />

      <h3 className="text-lg font-serif font-semibold text-copper mb-4">
        Últimos Pagamentos
      </h3>
      <PagamentosList />
    </div>
  );
};

export default Pagamentos;
