import { useServicos } from '@/hooks/useServicos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { StatusServico } from '@/types';

// Updated status config to match new types
const statusConfig: Record<string, { label: string; className: string }> = {
  'PENDENTE': {
    label: 'Pendente',
    className: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  'EM_ANDAMENTO': {
    label: 'Em Produção',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  'CONCLUIDO': {
    label: 'Entregue',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
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

const unknownStatusConfig = {
  label: 'Desconhecido',
  className: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusOptions: StatusServico[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO'];

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

  const formatTamanhos = (tamanhos: Record<string, number> | string | undefined) => {
    if (!tamanhos) return null;
    if (typeof tamanhos === 'string') return tamanhos; // Legacy support

    // Sort keys based on standard sizes if possible, or just keys
    const order = ['PP', 'P', 'M', 'G', 'GG', 'EXG'];
    const entries = Object.entries(tamanhos).filter(([_, qty]) => qty > 0);

    entries.sort((a, b) => {
      const idxA = order.indexOf(a[0]);
      const idxB = order.indexOf(b[0]);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a[0].localeCompare(b[0]);
    });

    return entries.map(([size, qty]) => `${qty} ${size}`).join(', ');
  };

  const cycleStatus = (currentStatus: string, id: string) => {
    let normalizedStatus: StatusServico = 'PENDENTE';

    if (currentStatus === 'Em Produção' || currentStatus === 'EM_ANDAMENTO') normalizedStatus = 'EM_ANDAMENTO';
    else if (currentStatus === 'Entregue/Faturado' || currentStatus === 'CONCLUIDO') normalizedStatus = 'CONCLUIDO';
    else normalizedStatus = 'PENDENTE';

    const currentIndex = statusOptions.indexOf(normalizedStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    updateServicoStatus(id, statusOptions[nextIndex]);
  };

  return (
    <div className="space-y-3">
      {servicos.map((servico, index) => {
        const safeStatus = servico.status || 'PENDENTE';
        const config = statusConfig[safeStatus] || unknownStatusConfig;

        const dateDisplay = servico.data_entrada?.toDate
          ? format(servico.data_entrada.toDate(), "dd/MM/yyyy", { locale: ptBR })
          : 'Data desconhecida';

        // Prefer 'tamanhos' object, fallback to 'detalhe_tamanhos' string
        const tamanhosDisplay = formatTamanhos(servico.tamanhos || servico.detalhe_tamanhos);

        return (
          <div
            key={servico.id || index}
            className="bg-card border border-border rounded-xl p-4 shadow-soft animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{servico.fornecedor || 'Fornecedor sem nome'}</p>
                <p className="text-copper font-medium">{servico.tipo_peca || 'Peça sem tipo'}</p>
                {servico?.numero_op && (
                  <p className="text-xs text-muted-foreground mt-1">
                    OP: {servico.numero_op}
                  </p>
                )}
                {tamanhosDisplay && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {tamanhosDisplay}
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
                  {formatCurrency(servico.valor_total_lote || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {servico.quantidade_total || 0} peças × {formatCurrency(servico.valor_unitario || 0)}
                </p>
              </div>

              <button
                onClick={() => servico.id && cycleStatus(safeStatus, servico.id)}
                className="flex items-center gap-1"
              >
                <Badge
                  variant="outline"
                  className={cn("text-sm py-1 px-3", config.className)}
                >
                  {config.label}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {dateDisplay}
            </p>
          </div>
        );
      })}
    </div>
  );
}
