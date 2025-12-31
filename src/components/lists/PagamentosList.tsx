import { usePagamentos } from '@/hooks/usePagamentos';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, CheckCircle2, Circle, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PagamentoAjudante } from '@/types';

interface PagamentosListProps {
  data?: PagamentoAjudante[];
}

export function PagamentosList({ data }: PagamentosListProps) {
  const { pagamentos: allPagamentos, loading, deletePagamento, togglePagamentoStatus } = usePagamentos();

  // Use props data if provided, otherwise use data from hook
  const pagamentos = data || allPagamentos;

  if (loading && !data) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (pagamentos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum pagamento encontrado.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-3">
      {pagamentos.map((pagamento, index) => {
        // Handle legacy data: treat undefined status as 'PENDENTE'
        const status = pagamento.status || 'PENDENTE';
        const isPago = status === 'PAGO';

        return (
          <div
            key={pagamento.id}
            className="bg-card border border-border rounded-xl p-4 shadow-soft animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{pagamento.nome_ajudante}</p>
                  <Badge
                    variant={isPago ? "default" : "outline"}
                    className={cn(
                      "text-[10px] h-5 px-2",
                      isPago ? "bg-emerald-500 hover:bg-emerald-600" : "text-amber-600 border-amber-200 bg-amber-50"
                    )}
                  >
                    {isPago ? "PAGO" : "PENDENTE"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {pagamento.data_trabalho?.toDate
                      ? format(pagamento.data_trabalho.toDate(), "dd 'de' MMMM", { locale: ptBR })
                      : "Data inválida"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={cn("text-lg font-bold", isPago ? "text-emerald-600" : "text-amber-600")}>
                  {formatCurrency(pagamento.valor_pago)}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 px-3 border-dashed",
                      isPago ? "text-muted-foreground hover:text-amber-600" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    )}
                    onClick={() => pagamento.id && togglePagamentoStatus(pagamento.id, pagamento.status)}
                  >
                    {isPago ? (
                      <span className="text-xs">Marcar Pendente</span>
                    ) : (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        <span className="text-xs">Pagar</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => pagamento.id && deletePagamento(pagamento.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
