import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useServicos } from '@/hooks/useServicos';
import { usePagamentos } from '@/hooks/usePagamentos';
import { DollarSign, TrendingUp, Users, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Servico } from '@/types';

const Index = () => {
  const { totalAReceber, producaoTotal, servicos, loading: loadingServicos, updateServicoStatus } = useServicos();
  const { totalDespesas, loading: loadingPagamentos } = usePagamentos();
  const navigate = useNavigate();

  const loading = loadingServicos || loadingPagamentos;

  const filaEspera = servicos.filter(s => s.status === 'PENDENTE');
  const emProducao = servicos.filter(s => s.status === 'EM_ANDAMENTO');

  const handleStartService = async (id: string) => {
    await updateServicoStatus(id, 'EM_ANDAMENTO');
  };

  const handleFinishService = async (id: string) => {
    await updateServicoStatus(id, 'CONCLUIDO');
  };

  const ServiceCard = ({ servico, action }: { servico: Servico; action: 'start' | 'finish' }) => {
    const isStart = action === 'start';

    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-soft mb-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-foreground">{servico.fornecedor}</h4>
            <p className="text-sm text-copper">{servico.tipo_peca}</p>
            {servico.numero_op && <p className="text-xs text-muted-foreground mt-1">OP: {servico.numero_op}</p>}
          </div>
          <div className="text-right">
             <p className="font-serif font-bold text-gold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.valor_total_lote)}
            </p>
            <p className="text-xs text-muted-foreground">{servico.quantidade_total} peças</p>
          </div>
        </div>

        {servico.foto_op_url && (
             <div className="mb-3">
                 <img src={servico.foto_op_url} alt="OP" className="h-20 w-auto rounded-md object-cover border border-border" />
             </div>
        )}

        <Button
          variant={isStart ? "outline" : "gold"}
          className="w-full mt-2"
          onClick={() => isStart ? handleStartService(servico.id!) : handleFinishService(servico.id!)}
        >
          {isStart ? (
            <>
              <Play className="w-4 h-4 mr-2" /> Iniciar Produção
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" /> Finalizar Serviço
            </>
          )}
        </Button>
      </div>
    );
  };

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

      {/* Summary Cards - Horizontal Scroll */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 mb-8">
        {loading ? (
          <>
            <div className="h-28 min-w-[280px] bg-muted rounded-2xl animate-pulse flex-shrink-0 snap-start" />
            <div className="h-28 min-w-[280px] bg-muted rounded-2xl animate-pulse flex-shrink-0 snap-start" />
            <div className="h-28 min-w-[280px] bg-muted rounded-2xl animate-pulse flex-shrink-0 snap-start" />
          </>
        ) : (
          <>
            <div className="min-w-[280px] flex-shrink-0 snap-start">
              <SummaryCard
                title="Serviços a Receber"
                value={totalAReceber}
                icon={DollarSign}
                variant="gold"
                subtitle="Pendentes + Em produção"
              />
            </div>
            <div className="min-w-[280px] flex-shrink-0 snap-start">
              <SummaryCard
                title="Produção Total (Receita)"
                value={producaoTotal}
                icon={TrendingUp}
                variant="copper"
                subtitle="Todos os serviços"
              />
            </div>
            <div className="min-w-[280px] flex-shrink-0 snap-start">
              <SummaryCard
                title="Despesas com Ajudantes"
                value={totalDespesas}
                icon={Users}
                variant="neutral"
                subtitle="Total de diárias"
              />
            </div>
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

      {/* Em Produção Section */}
      <div className="mb-8">
        <h3 className="text-lg font-serif font-semibold text-gold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Em Produção ({emProducao.length})
        </h3>
        {emProducao.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">Nenhum serviço em andamento no momento.</p>
        ) : (
            emProducao.map(servico => (
                <ServiceCard key={servico.id} servico={servico} action="finish" />
            ))
        )}
      </div>

      {/* Fila de Espera Section */}
      <div className="mb-8">
        <h3 className="text-lg font-serif font-semibold text-copper mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Fila de Espera ({filaEspera.length})
        </h3>
        {filaEspera.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">Sua fila de espera está vazia.</p>
        ) : (
            filaEspera.map(servico => (
                <ServiceCard key={servico.id} servico={servico} action="start" />
            ))
        )}
      </div>

    </div>
  );
};

export default Index;
