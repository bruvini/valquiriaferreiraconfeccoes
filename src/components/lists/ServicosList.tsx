import { useServicos } from '@/hooks/useServicos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { StatusServico } from '@/types';

const statusConfig: Record<StatusServico, { label: string; className: string }> = {
  'Pendente': { 
    label: 'Pendente', 
    className: 'bg-amber-100 text-amber-800 border-amber-200' 
  },
  'Em Produção': { 
    label: 'Em Produção', 
    className: 'bg-blue-100 text-blue-800 border-blue-200' 
  },
  'Entregue/Faturado': { 
    label: 'Entregue', 
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
  },
};

const statusOptions: StatusServico[] = ['Pendente', 'Em Produção', 'Entregue/Faturado'];

export function ServicosList() {
  const { servicos, loading, updateServicoStatus, deleteServico } = useServicos();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (servicos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum serviço registrado ainda.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const cycleStatus = (currentStatus: StatusServico, id: string) => {
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    updateServicoStatus(id, statusOptions[nextIndex]);
  };

  return (
    <div className="space-y-3">
      {servicos.map((servico, index) => (
        <div
          key={servico.id}
          className="bg-card border border-border rounded-xl p-4 shadow-soft animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="font-semibold text-foreground">{servico.fornecedor}</p>
              <p className="text-copper font-medium">{servico.tipo_peca}</p>
              {servico.detalhe_tamanhos && (
                <p className="text-sm text-muted-foreground mt-1">
                  {servico.detalhe_tamanhos}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => servico.id && deleteServico(servico.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold font-serif text-gold">
                {formatCurrency(servico.valor_total_lote)}
              </p>
              <p className="text-xs text-muted-foreground">
                {servico.quantidade_total} peças × {formatCurrency(servico.valor_unitario)}
              </p>
            </div>

            <button
              onClick={() => servico.id && cycleStatus(servico.status, servico.id)}
              className="flex items-center gap-1"
            >
              <Badge 
                variant="outline" 
                className={cn("text-sm py-1 px-3", statusConfig[servico.status].className)}
              >
                {statusConfig[servico.status].label}
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {format(servico.data_entrada.toDate(), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
      ))}
    </div>
  );
}
