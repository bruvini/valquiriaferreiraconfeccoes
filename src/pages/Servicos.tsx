import { ServicosList } from '@/components/lists/ServicosList';
import { useServicos } from '@/hooks/useServicos';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Servicos = () => {
  const navigate = useNavigate();
  const { producaoTotal, servicos } = useServicos();

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(producaoTotal);

  return (
    <div className="pb-24">
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
            Todos os Serviços
          </h2>
          <p className="text-muted-foreground text-sm">
            {servicos.length} serviço{servicos.length !== 1 ? 's' : ''} registrado{servicos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-gold">{formattedTotal}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
        <Package className="w-4 h-4" />
        <span>Toque no status para alterar</span>
      </div>

      <ServicosList />
    </div>
  );
};

export default Servicos;
