import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useServicos } from '@/hooks/useServicos';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceAI } from '@/hooks/useVoiceAI';
import { Package, Calculator, Mic, MicOff, Loader2, Sparkles, Camera, Image as ImageIcon } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { parseDateToNoon } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'EXG'];

export function NovoServicoForm() {
  const [numeroOP, setNumeroOP] = useState('');
  const [dataChegada, setDataChegada] = useState(new Date().toISOString().split('T')[0]);
  const [fornecedor, setFornecedor] = useState('');
  const [cliente, setCliente] = useState('');
  const [tipoPeca, setTipoPeca] = useState('');
  const [tipoTecido, setTipoTecido] = useState('');

  // Replaced detailed text string with object state
  const [tamanhos, setTamanhos] = useState<Record<string, number>>({
    'PP': 0, 'P': 0, 'M': 0, 'G': 0, 'GG': 0, 'EXG': 0
  });

  const [quantidade, setQuantidade] = useState(0); // number state
  const [valorUnitario, setValorUnitario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [fotoOP, setFotoOP] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addServico } = useServicos();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechRecognition();
  const { isProcessing, error: aiError, processTranscript } = useVoiceAI();

  // Process transcript when listening stops and we have text
  useEffect(() => {
    if (!isListening && transcript) {
      handleProcessVoice(transcript);
    }
  }, [isListening, transcript]);

  // Auto-sum quantity when tamanhos change
  useEffect(() => {
    const total = Object.values(tamanhos).reduce((acc, curr) => acc + (curr || 0), 0);
    setQuantidade(total);
  }, [tamanhos]);

  const handleProcessVoice = async (text: string) => {
    const result = await processTranscript(text);
    
    if (result) {
      if (result.numero_op) setNumeroOP(result.numero_op);
      if (result.fornecedor) setFornecedor(result.fornecedor);
      if (result.cliente) setCliente(result.cliente);
      if (result.tipo_peca) setTipoPeca(result.tipo_peca);
      if (result.tipo_tecido) setTipoTecido(result.tipo_tecido);
      if (result.observacoes) setObservacoes(result.observacoes);
      if (result.preco_unitario) setValorUnitario(result.preco_unitario.toString().replace('.', ','));
      
      // Map AI sizes to grid
      if (result.tamanhos) {
        const newSizes = { ...tamanhos };
        Object.entries(result.tamanhos).forEach(([key, val]) => {
          // Normalize key to upper case to match our keys
          const normKey = key.toUpperCase();
          if (newSizes.hasOwnProperty(normKey)) {
             newSizes[normKey] = val;
          }
        });
        setTamanhos(newSizes);
      }

      toast({
        title: "Formulário preenchido!",
        description: "Confira os dados e ajuste se necessário.",
      });
    } else if (aiError) {
        toast({
            title: "Erro na IA",
            description: aiError,
            variant: "destructive"
        });
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoOP(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSizeChange = (size: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setTamanhos(prev => ({
      ...prev,
      [size]: Math.max(0, numValue)
    }));
  };

  const valorNum = parseFloat(valorUnitario.replace(',', '.')) || 0;
  const valorTotal = quantidade * valorNum;

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedor || !tipoPeca || quantidade === 0 || !valorUnitario) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha fornecedor, peça, valor e pelo menos um tamanho.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use helper to fix timezone off-by-one error
      const dataEntradaDate = parseDateToNoon(dataChegada);

      let fotoUrl = null;

      if (fotoOP) {
        const storageRef = ref(storage, `ordens_producao/${Date.now()}_${fotoOP.name}`);
        const snapshot = await uploadBytes(storageRef, fotoOP);
        fotoUrl = await getDownloadURL(snapshot.ref);
      }

      await addServico({
        numero_op: numeroOP,
        data_chegada: dataChegada, // Keeps string for display if needed
        data_entrada: Timestamp.fromDate(dataEntradaDate), // Ensure data_entrada (Firestore) is correct
        fornecedor,
        cliente,
        tipo_peca: tipoPeca,
        tipo_tecido: tipoTecido,
        tamanhos: tamanhos, // New object structure
        quantidade_total: quantidade,
        valor_unitario: valorNum,
        status: 'PENDENTE',
        observacoes,
        foto_op_url: fotoUrl,
      });
      
      toast({
        title: "Serviço registrado!",
        description: `${tipoPeca} - ${formattedTotal}`,
      });
      
      navigate('/');
    } catch (error) {
        console.error(error);
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
      {/* Voice AI Button */}
      <div className="space-y-3">
        <Button
          type="button"
          variant={isListening ? "destructive" : "gold"}
          size="lg"
          className="w-full h-14 text-lg relative overflow-hidden"
          onClick={handleVoiceClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Processando com IA...
            </>
          ) : isListening ? (
            <>
              <MicOff className="w-6 h-6 mr-2" />
              Parar de Gravar
              <span className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </>
          ) : (
            <>
              <Mic className="w-6 h-6 mr-2" />
              <Sparkles className="w-4 h-4 mr-1" />
              Preencher com IA
            </>
          )}
        </Button>

        {isListening && (
          <div className="bg-accent/50 rounded-xl p-4 border border-copper/20 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-1">Ouvindo...</p>
            <p className="text-foreground font-medium">
              {transcript || "Fale os detalhes do serviço..."}
            </p>
          </div>
        )}

        {(speechError || aiError) && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
            {speechError || aiError}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou preencha manualmente</span>
        </div>
      </div>

       {/* Dados Iniciais */}
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numeroOP" className="text-base font-medium text-copper">
            Número da OP
          </Label>
          <Input
            id="numeroOP"
            placeholder="Ex: 12345"
            value={numeroOP}
            onChange={(e) => setNumeroOP(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataChegada" className="text-base font-medium text-copper">
            Data de Chegada
          </Label>
          <Input
            id="dataChegada"
            type="date"
            value={dataChegada}
            onChange={(e) => setDataChegada(e.target.value)}
          />
        </div>
      </div>

      {/* Foto Upload */}
      <div className="space-y-2">
        <Label className="text-base font-medium text-copper">Foto da Ordem de Produção</Label>
        <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
        >
            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
            />
            {fotoPreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
            ) : (
                <>
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Toque para tirar foto ou enviar arquivo</span>
                </>
            )}
        </div>
      </div>

      {/* Fornecedor */}
      <div className="space-y-2">
        <Label htmlFor="fornecedor" className="text-base font-medium text-copper">
          Fornecedor *
        </Label>
        <Input
          id="fornecedor"
          placeholder="Nome da empresa"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
        />
      </div>

      {/* Cliente */}
      <div className="space-y-2">
        <Label htmlFor="cliente" className="text-base font-medium text-copper">
          Cliente
        </Label>
        <Input
          id="cliente"
          placeholder="Nome do cliente final (opcional)"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
      </div>

      {/* Tipo de Peça & Tipo de Tecido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipoPeca" className="text-base font-medium text-copper">
            Tipo de Peça *
          </Label>
          <Input
            id="tipoPeca"
            placeholder="Ex: Camisa Polo"
            value={tipoPeca}
            onChange={(e) => setTipoPeca(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoTecido" className="text-base font-medium text-copper">
            Tipo de Tecido
          </Label>
          <Input
            id="tipoTecido"
            placeholder="Ex: Malha, Jeans"
            value={tipoTecido}
            onChange={(e) => setTipoTecido(e.target.value)}
          />
        </div>
      </div>

      {/* Grade de Tamanhos (New Grid Layout) */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-copper">
          Grade de Tamanhos
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {SIZES.map((size) => (
            <div key={size} className="space-y-1">
              <Label htmlFor={`size-${size}`} className="text-xs text-muted-foreground text-center block">
                {size}
              </Label>
              <Input
                id={`size-${size}`}
                type="number"
                inputMode="numeric"
                min="0"
                className="text-center font-medium"
                value={tamanhos[size] === 0 ? '' : tamanhos[size]}
                placeholder="0"
                onChange={(e) => handleSizeChange(size, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quantidade e Valor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantidade" className="text-base font-medium text-copper">
            Quantidade Total
          </Label>
          <Input
            id="quantidade"
            type="number"
            readOnly
            className="bg-muted font-bold text-foreground"
            value={quantidade}
          />
          <p className="text-[10px] text-muted-foreground">*Calculado automaticamente</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor" className="text-base font-medium text-copper">
            Valor por Peça (R$) *
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

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes" className="text-base font-medium text-copper">
          Observações
        </Label>
        <Textarea
          id="observacoes"
          placeholder="Detalhes adicionais, prazo, etc."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="min-h-[80px] text-base"
        />
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
            {quantidade} peças × R$ {valorNum.toFixed(2).replace('.', ',')}
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
