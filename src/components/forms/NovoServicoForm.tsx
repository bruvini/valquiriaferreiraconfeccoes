import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useServicos } from '@/hooks/useServicos';
import { useToast } from '@/hooks/use-toast';
import { Package, Calculator } from 'lucide-react';

export function NovoServicoForm() {
  const [fornecedor, setFornecedor] = useState('');
  const [tipoPeca, setTipoPeca] = useState('');
  const [detalheTamanhos, setDetalheTamanhos] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [loading, setLoading] = useState(false);

  const { addServico } = useServicos();
  const { toast } = useToast();
  const navigate = useNavigate();

  const quantidadeNum = parseInt(quantidade) || 0;
  const valorNum = parseFloat(valorUnitario.replace(',', '.')) || 0;
  const valorTotal = quantidadeNum * valorNum;

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedor || !tipoPeca || !quantidade || !valorUnitario) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addServico({
        fornecedor,
        tipo_peca: tipoPeca,
        detalhe_tamanhos: detalheTamanhos,
        quantidade_total: quantidadeNum,
        valor_unitario: valorNum,
        status: 'Pendente',
      });
      
      toast({
        title: "Serviço registrado!",
        description: `${tipoPeca} - ${formattedTotal}`,
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fornecedor" className="text-base font-medium text-copper">
          Fornecedor
        </Label>
        <Input
          id="fornecedor"
          placeholder="Nome da empresa"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoPeca" className="text-base font-medium text-copper">
          Tipo de Peça
        </Label>
        <Input
          id="tipoPeca"
          placeholder="Ex: Camisa Polo, Jaleco..."
          value={tipoPeca}
          onChange={(e) => setTipoPeca(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tamanhos" className="text-base font-medium text-copper">
          Descrição dos Tamanhos (opcional)
        </Label>
        <Textarea
          id="tamanhos"
          placeholder="Ex: 10 P, 15 M, 5 GG"
          value={detalheTamanhos}
          onChange={(e) => setDetalheTamanhos(e.target.value)}
          className="min-h-[80px] text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantidade" className="text-base font-medium text-copper">
            Quantidade Total
          </Label>
          <Input
            id="quantidade"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor" className="text-base font-medium text-copper">
            Valor por Peça (R$)
          </Label>
          <Input
            id="valor"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={valorUnitario}
            onChange={(e) => setValorUnitario(e.target.value)}
          />
        </div>
      </div>

      {/* Total em Destaque */}
      {valorTotal > 0 && (
        <div className="bg-gradient-gold rounded-2xl p-6 shadow-gold animate-scale-in">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-5 h-5 text-primary-foreground/80" />
            <span className="text-sm font-medium text-primary-foreground/80">
              Total deste serviço
            </span>
          </div>
          <p className="text-3xl font-bold font-serif text-primary-foreground">
            {formattedTotal}
          </p>
          <p className="text-sm text-primary-foreground/70 mt-1">
            {quantidadeNum} peças × R$ {valorNum.toFixed(2).replace('.', ',')}
          </p>
        </div>
      )}

      <Button
        type="submit"
        variant="copper"
        size="lg"
        className="w-full"
        disabled={loading || valorTotal === 0}
      >
        <Package className="w-5 h-5" />
        {loading ? 'Salvando...' : 'Registrar Serviço'}
      </Button>
    </form>
  );
}
