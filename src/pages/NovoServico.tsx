import { NovoServicoForm } from '@/components/forms/NovoServicoForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NovoServico = () => {
  const navigate = useNavigate();

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
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Novo Serviço
          </h2>
          <p className="text-muted-foreground text-sm">
            Registre um novo lote de peças
          </p>
        </div>
      </div>

      <NovoServicoForm />
    </div>
  );
};

export default NovoServico;
