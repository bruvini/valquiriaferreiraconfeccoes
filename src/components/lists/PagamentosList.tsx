import { usePagamentos } from '@/hooks/usePagamentos';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PagamentosList() {
  const { pagamentos, loading, deletePagamento } = usePagamentos();

  if (loading) {
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
        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum pagamento registrado ainda.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-3">
      {pagamentos.map((pagamento, index) => (
        <div
          key={pagamento.id}
          className="bg-card border border-border rounded-xl p-4 shadow-soft animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-foreground">{pagamento.nome_ajudante}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(pagamento.data_trabalho.toDate(), "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-copper">
                {formatCurrency(pagamento.valor_pago)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                onClick={() => pagamento.id && deletePagamento(pagamento.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
