import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useServicos } from '@/hooks/useServicos';
import { usePagamentos } from '@/hooks/usePagamentos';
import { DollarSign, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { totalAReceber, producaoTotal, servicos, loading: loadingServicos } = useServicos();
  const { totalDespesas, loading: loadingPagamentos } = usePagamentos();
  const navigate = useNavigate();

  const loading = loadingServicos || loadingPagamentos;

  const recentServicos = servicos.slice(0, 3);

  return (
    <div className="pb-24">
      {/* Welcome Section */}
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Olá, Valquiria! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo do seu mês
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4 mb-8">
        {loading ? (
          <>
            <div className="h-28 bg-muted rounded-2xl animate-pulse" />
            <div className="h-28 bg-muted rounded-2xl animate-pulse" />
            <div className="h-28 bg-muted rounded-2xl animate-pulse" />
          </>
        ) : (
          <>
            <SummaryCard
              title="Serviços a Receber"
              value={totalAReceber}
              icon={DollarSign}
              variant="gold"
              subtitle="Pendentes + Em produção"
            />
            <SummaryCard
              title="Produção Total (Receita)"
              value={producaoTotal}
              icon={TrendingUp}
              variant="copper"
              subtitle="Todos os serviços"
            />
            <SummaryCard
              title="Despesas com Ajudantes"
              value={totalDespesas}
              icon={Users}
              variant="neutral"
              subtitle="Total de diárias"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Button 
          variant="gold" 
          size="lg" 
          className="h-auto py-4 flex-col gap-1"
          onClick={() => navigate('/novo-servico')}
        >
          <span className="text-lg">+</span>
          <span>Novo Serviço</span>
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-auto py-4 flex-col gap-1"
          onClick={() => navigate('/pagamentos')}
        >
          <Users className="w-5 h-5" />
          <span>Pagar Ajudante</span>
        </Button>
      </div>

      {/* Recent Services */}
      {recentServicos.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-serif font-semibold text-copper">
              Últimos Serviços
            </h3>
            <Button 
              variant="link" 
              className="text-copper p-0 h-auto"
              onClick={() => navigate('/servicos')}
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentServicos.map((servico) => (
              <div 
                key={servico.id} 
                className="bg-card border border-border rounded-xl p-4 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{servico.fornecedor}</p>
                    <p className="text-sm text-copper">{servico.tipo_peca}</p>
                  </div>
                  <p className="text-lg font-bold font-serif text-gold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(servico.valor_total_lote)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && servicos.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
            <DollarSign className="w-10 h-10 text-copper" />
          </div>
          <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
            Comece agora!
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
            Registre seu primeiro serviço e acompanhe tudo pelo app.
          </p>
          <Button 
            variant="gold" 
            size="lg"
            onClick={() => navigate('/novo-servico')}
          >
            Registrar Primeiro Serviço
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
