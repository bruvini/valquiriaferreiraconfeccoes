import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagamentos } from '@/hooks/usePagamentos';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { UserPlus, Loader2 } from 'lucide-react';
import { parseDateToNoon } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  nome_ajudante: z.string().min(1, "Selecione quem foi o ajudante."),
  data_trabalho: z.string().min(1, "A data informada não parece correta."),
  valor_pago: z.string().min(1, "Digite o valor.").refine((val) => {
    const num = parseFloat(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, "O valor deve ser maior que zero."),
});

type FormValues = z.infer<typeof formSchema>;

export function PagamentoForm() {
  const [loading, setLoading] = useState(false);
  const { addPagamento } = usePagamentos();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_ajudante: '',
      data_trabalho: '',
      valor_pago: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const valorNum = parseFloat(data.valor_pago.replace(',', '.'));

      await addPagamento({
        nome_ajudante: data.nome_ajudante,
        data_trabalho: Timestamp.fromDate(parseDateToNoon(data.data_trabalho)),
        valor_pago: valorNum,
        status: 'PENDENTE' // Default status per previous logic
      });
      
      toast({
        title: "Tudo certo! Pagamento registrado.",
        description: `${data.nome_ajudante} - R$ ${valorNum.toFixed(2).replace('.', ',')}`,
        className: "bg-green-50 border-green-200 text-green-900",
      });
      
      form.reset();
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
        <FormField
          control={form.control}
          name="nome_ajudante"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-copper">Quem trabalhou?</FormLabel>
              <FormControl>
                <Input placeholder="Nome da ajudante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_trabalho"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-copper">Qual dia?</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor_pago"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-copper">Valor pago (R$)</FormLabel>
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
               <UserPlus className="w-5 h-5 mr-2" />
               Registrar Pagamento
             </>
          )}
        </Button>
      </form>
    </Form>
  );
}
