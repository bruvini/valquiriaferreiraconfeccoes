import { PagamentoForm } from '@/components/forms/PagamentoForm';
import { PagamentosList } from '@/components/lists/PagamentosList';
import { usePagamentos } from '@/hooks/usePagamentos';
import { ArrowLeft, Wallet, Filter, X, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const Pagamentos = () => {
  const navigate = useNavigate();
  const { pagamentos, loading } = usePagamentos();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtering Logic
  const filteredPagamentos = pagamentos.filter(p => {
    if (!startDate && !endDate) return true;

    if (!p.data_trabalho) return false;
    const date = p.data_trabalho.toDate();

    // Normalize time to start of day for comparison consistency
    date.setHours(0, 0, 0, 0);

    let start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);

    let end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    if (start && date < start) return false;
    if (end && date > end) return false;

    return true;
  });

  // Calculate Metrics
  const totalGeral = filteredPagamentos.reduce((acc, p) => acc + p.valor_pago, 0);

  const totalPago = filteredPagamentos
    .filter(p => p.status === 'PAGO')
    .reduce((acc, p) => acc + p.valor_pago, 0);

  const totalPendente = filteredPagamentos
    .filter(p => !p.status || p.status === 'PENDENTE') // Handle legacy as pending
    .reduce((acc, p) => acc + p.valor_pago, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

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
            Controle financeiro de ajudantes
          </p>
        </div>
      </div>

      {/* Financial Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border shadow-soft">
          <CardContent className="p-4 flex flex-col gap-1">
             <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Total Geral
             </span>
             <span className="text-2xl font-bold font-serif text-foreground">
                {formatCurrency(totalGeral)}
             </span>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-100 shadow-soft">
          <CardContent className="p-4 flex flex-col gap-1">
             <span className="text-sm text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Pago
             </span>
             <span className="text-2xl font-bold font-serif text-emerald-700">
                {formatCurrency(totalPago)}
             </span>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100 shadow-soft">
          <CardContent className="p-4 flex flex-col gap-1">
             <span className="text-sm text-amber-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Pendente
             </span>
             <span className="text-2xl font-bold font-serif text-amber-700">
                {formatCurrency(totalPendente)}
             </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
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

      {/* New Payment Form Accordion/Section */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-copper" />
          <h3 className="font-semibold text-foreground">Registrar Novo Pagamento</h3>
        </div>
        <PagamentoForm />
      </div>

      <Separator className="my-6" />

      <h3 className="text-lg font-serif font-semibold text-copper mb-4">
        Histórico de Pagamentos ({filteredPagamentos.length})
      </h3>

      {/* Pass filtered data to the list */}
      <PagamentosList data={filteredPagamentos} />
    </div>
  );
};

export default Pagamentos;
