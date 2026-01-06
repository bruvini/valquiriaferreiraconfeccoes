import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { useServicos } from '@/hooks/useServicos';
import { usePagamentos } from '@/hooks/usePagamentos';
import { DollarSign, TrendingUp, Users, ArrowRight, Play, CheckCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Servico } from '@/types';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseDateToStartOfDay, parseDateToEndOfDay } from '@/lib/utils';

const Index = () => {
  const { servicos, loading: loadingServicos, updateServicoStatus } = useServicos();
  const { pagamentos, loading: loadingPagamentos } = usePagamentos();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loading = loadingServicos || loadingPagamentos;

  // Filtering Logic
  const getFilteredData = () => {
    let filteredServicos = servicos;
    let filteredPagamentos = pagamentos;

    if (startDate && endDate) {
      const start = parseDateToStartOfDay(startDate);
      const end = parseDateToEndOfDay(endDate);

      filteredServicos = servicos.filter(s => {
        if (!s.data_entrada) return false;
        const date = s.data_entrada.toDate();
        return date >= start && date <= end;
      });

      filteredPagamentos = pagamentos.filter(p => {
        if (!p.data_trabalho) return false;
        const date = p.data_trabalho.toDate();
        return date >= start && date <= end;
      });
    }

    return { filteredServicos, filteredPagamentos };
  };

  const { filteredServicos, filteredPagamentos } = getFilteredData();

  // Recalculate Totals based on filtered data
  const totalAReceber = filteredServicos
    .filter(s => s.status !== 'CONCLUIDO')
    .reduce((acc, s) => acc + s.valor_total_lote, 0);

  const producaoTotal = filteredServicos.reduce((acc, s) => acc + s.valor_total_lote, 0);

  const totalDespesas = filteredPagamentos.reduce((acc, p) => acc + p.valor_pago, 0);

  const filaEspera = filteredServicos.filter(s => s.status === 'PENDENTE');
  const emProducao = filteredServicos.filter(s => s.status === 'EM_ANDAMENTO');

  const handleStartService = async (id: string) => {
    await updateServicoStatus(id, 'EM_ANDAMENTO');
  };

  const handleFinishService = async (id: string) => {
    await updateServicoStatus(id, 'CONCLUIDO');
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
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
    <div className="pb-24 overflow-x-hidden">
      {/* Welcome Section */}
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-serif font-bold text-foreground">
          Olá, Valquiria! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo do seu mês
        </p>
      </div>

      {/* Date Filter Section */}
      <div className="mb-6 bg-card border border-border rounded-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-3 text-copper font-medium">
          <Filter className="w-4 h-4" />
          <span>Filtrar por Período</span>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full">
             <Label htmlFor="startDate" className="text-xs mb-1 block text-muted-foreground">De</Label>
             <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
             />
          </div>
          <div className="w-full">
             <Label htmlFor="endDate" className="text-xs mb-1 block text-muted-foreground">Até</Label>
             <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
             />
          </div>
          {(startDate || endDate) && (
            <Button variant="ghost" onClick={clearFilter} className="w-full md:w-auto text-muted-foreground">
              <X className="w-4 h-4 mr-2" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards - Horizontal Scroll Mobile / Grid Desktop */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0 mb-8 w-full">
        {loading ? (
          <>
            <div className="h-28 min-w-[280px] w-full md:min-w-0 bg-muted rounded-2xl animate-pulse snap-center" />
            <div className="h-28 min-w-[280px] w-full md:min-w-0 bg-muted rounded-2xl animate-pulse snap-center" />
            <div className="h-28 min-w-[280px] w-full md:min-w-0 bg-muted rounded-2xl animate-pulse snap-center" />
          </>
        ) : (
          <>
            <div className="min-w-[85vw] md:min-w-0 snap-center">
              <SummaryCard
                title="Serviços a Receber"
                value={totalAReceber}
                icon={DollarSign}
                variant="gold"
                subtitle="Pendentes + Em produção"
              />
            </div>
            <div className="min-w-[85vw] md:min-w-0 snap-center">
              <SummaryCard
                title="Produção Total (Receita)"
                value={producaoTotal}
                icon={TrendingUp}
                variant="copper"
                subtitle="Todos os serviços"
              />
            </div>
            <div className="min-w-[85vw] md:min-w-0 snap-center">
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
            <p className="text-muted-foreground text-sm italic">Nenhum serviço em andamento no período selecionado.</p>
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
