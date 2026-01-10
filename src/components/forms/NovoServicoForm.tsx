import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useServicos } from '@/hooks/useServicos';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceAI } from '@/hooks/useVoiceAI';
import { Package, Calculator, Mic, MicOff, Loader2, Sparkles, Camera } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { parseDateToNoon } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'EXG'];

const formSchema = z.object({
  numero_op: z.string().optional(),
  data_chegada: z.string().min(1, "A data de chegada é obrigatória."),
  fornecedor: z.string().min(1, "Por favor, preencha o nome do fornecedor."),
  cliente: z.string().optional(),
  tipo_peca: z.string().min(1, "Diga qual é o tipo de roupa (ex: Calça, Camisa)."),
  tipo_tecido: z.string().optional(),
  tamanhos: z.record(z.number()),
  valor_unitario: z.string().min(1, "O valor deve ser maior que zero.").refine((val) => {
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, "O valor deve ser maior que zero."),
  observacoes: z.string().optional(),
}).refine((data) => {
  const total = Object.values(data.tamanhos).reduce((acc, curr) => acc + (curr || 0), 0);
  return total > 0;
}, {
  message: "Você precisa informar pelo menos um tamanho na grade.",
  path: ["tamanhos"], // Attach error to a field so we can show it generally or via toast
});

type FormValues = z.infer<typeof formSchema>;

export function NovoServicoForm() {
  const [loading, setLoading] = useState(false);
  const [fotoOP, setFotoOP] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addServico } = useServicos();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechRecognition();
  const { isProcessing, error: aiError, processTranscript } = useVoiceAI();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero_op: '',
      data_chegada: new Date().toISOString().split('T')[0],
      fornecedor: '',
      cliente: '',
      tipo_peca: '',
      tipo_tecido: '',
      tamanhos: { 'PP': 0, 'P': 0, 'M': 0, 'G': 0, 'GG': 0, 'EXG': 0 },
      valor_unitario: '',
      observacoes: '',
    },
  });

  const tamanhos = useWatch({ control: form.control, name: 'tamanhos' });
  const valorUnitario = useWatch({ control: form.control, name: 'valor_unitario' });

  const quantidadeTotal = Object.values(tamanhos || {}).reduce((acc, curr) => acc + (curr || 0), 0);
  const valorNum = parseFloat(valorUnitario?.replace(',', '.') || '0');
  const valorTotal = quantidadeTotal * valorNum;

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotal);

  // Process transcript when listening stops and we have text
  useEffect(() => {
    if (!isListening && transcript) {
      handleProcessVoice(transcript);
    }
  }, [isListening, transcript]);

  const handleProcessVoice = async (text: string) => {
    const result = await processTranscript(text);
    
    if (result) {
      if (result.numero_op) form.setValue('numero_op', result.numero_op);
      if (result.fornecedor) form.setValue('fornecedor', result.fornecedor);
      if (result.cliente) form.setValue('cliente', result.cliente || '');
      if (result.tipo_peca) form.setValue('tipo_peca', result.tipo_peca);
      if (result.tipo_tecido) form.setValue('tipo_tecido', result.tipo_tecido || '');
      if (result.observacoes) form.setValue('observacoes', result.observacoes || '');
      if (result.preco_unitario) form.setValue('valor_unitario', result.preco_unitario.toString().replace('.', ','));
      
      if (result.tamanhos) {
        const currentSizes = form.getValues('tamanhos');
        const newSizes = { ...currentSizes };
        Object.entries(result.tamanhos).forEach(([key, val]) => {
          const normKey = key.toUpperCase();
          if (newSizes.hasOwnProperty(normKey)) {
             newSizes[normKey] = val;
          }
        });
        form.setValue('tamanhos', newSizes);
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

  const onSubmit = async (data: FormValues) => {
    if (quantidadeTotal === 0) {
      toast({
        title: "Atenção",
        description: "Você precisa informar pelo menos um tamanho na grade (P, M, G...) para continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dataEntradaDate = parseDateToNoon(data.data_chegada);
      let fotoUrl = null;

      if (fotoOP) {
        const storageRef = ref(storage, `ordens_producao/${Date.now()}_${fotoOP.name}`);
        const snapshot = await uploadBytes(storageRef, fotoOP);
        fotoUrl = await getDownloadURL(snapshot.ref);
      }

      const valorNumFinal = parseFloat(data.valor_unitario.replace(',', '.'));

      await addServico({
        numero_op: data.numero_op || null,
        data_chegada: data.data_chegada,
        data_entrada: Timestamp.fromDate(dataEntradaDate),
        fornecedor: data.fornecedor,
        cliente: data.cliente || null,
        tipo_peca: data.tipo_peca,
        tipo_tecido: data.tipo_tecido || null,
        tamanhos: data.tamanhos,
        quantidade_total: quantidadeTotal,
        valor_unitario: valorNumFinal,
        status: 'PENDENTE',
        observacoes: data.observacoes || null,
        foto_op_url: fotoUrl,
      });
      
      toast({
        title: "Prontinho!",
        description: `O serviço de ${data.tipo_peca} foi salvo com sucesso.`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Não consegui salvar agora. Tente novamente em alguns instantes.";

      if (error?.message?.includes('offline') || !navigator.onLine) {
         errorMessage = "Parece que estamos sem internet. Verifique sua conexão.";
      }

      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
          <FormField
            control={form.control}
            name="numero_op"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-copper">Número da OP</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="data_chegada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-copper">Data de Chegada</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Foto Upload */}
        <div className="space-y-2">
          <FormLabel className="text-base font-medium text-copper">Foto da Ordem de Produção</FormLabel>
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

        <FormField
          control={form.control}
          name="fornecedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-copper">Fornecedor *</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-copper">Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente final (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo_peca"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-copper">Tipo de Peça *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Camisa Polo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo_tecido"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-copper">Tipo de Tecido</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Malha, Jeans" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Grade de Tamanhos */}
        <div className="space-y-3">
          <FormLabel className="text-base font-medium text-copper">Grade de Tamanhos</FormLabel>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {SIZES.map((size) => (
              <FormField
                key={size}
                control={form.control}
                name={`tamanhos.${size}`}
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs text-muted-foreground text-center block">{size}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        className="text-center font-medium"
                        placeholder="0"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
          {/* Show global error for tamanhos if validation fails */}
          {form.formState.errors.tamanhos && (
             <p className="text-sm font-medium text-destructive mt-2">
               {form.formState.errors.tamanhos.message}
             </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormItem>
             <FormLabel className="text-base font-medium text-copper">Quantidade Total</FormLabel>
             <FormControl>
                <Input
                  readOnly
                  className="bg-muted font-bold text-foreground"
                  value={quantidadeTotal}
                />
             </FormControl>
             <p className="text-[10px] text-muted-foreground">*Calculado automaticamente</p>
          </FormItem>

          <FormField
            control={form.control}
            name="valor_unitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-copper">Valor por Peça (R$) *</FormLabel>
                <FormControl>
                  <Input
                    inputMode="decimal"
                    placeholder="0,00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-copper">Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes adicionais, prazo, etc."
                  className="min-h-[80px] text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              {quantidadeTotal} peças × R$ {valorNum.toFixed(2).replace('.', ',')}
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="copper"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
             <>
               <Loader2 className="w-5 h-5 mr-2 animate-spin" />
               Salvando... aguarde
             </>
          ) : (
             <>
               <Package className="w-5 h-5 mr-2" />
               Registrar Serviço
             </>
          )}
        </Button>
      </form>
    </Form>
  );
}
