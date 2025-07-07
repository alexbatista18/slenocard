import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const orderFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 caracteres"),
  endereco: z.string().min(10, "Endereço deve ser mais detalhado")
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function OrderForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      whatsapp: "",
      endereco: ""
    }
  });

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      console.log("Form submitted:", data);
      
      toast({
        title: "Pedido enviado com sucesso!",
        description: "Entraremos em contato via WhatsApp para confirmar seu pedido.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pedido" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Falta pouco para você impulsionar suas avaliações!</h2>
          <p className="text-xl text-slenocard-light">Preencha seus dados e receba seu SlenoCard em casa</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 rounded-lg bg-slenocard-gray border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-slenocard-orange transition-colors duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-slenocard-gray border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-slenocard-orange transition-colors duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-lg bg-slenocard-gray border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-slenocard-orange transition-colors duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Endereço Completo para Envio</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
                      className="w-full px-4 py-3 rounded-lg bg-slenocard-gray border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-slenocard-orange transition-colors duration-200 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slenocard-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isSubmitting ? "Enviando..." : "Finalizar Compra"}
            </Button>
            
            <p className="text-center text-sm text-slenocard-light">
              Seus dados estão seguros e protegidos. Entraremos em contato via WhatsApp para confirmar o pedido.
            </p>
          </form>
        </Form>
      </div>
    </section>
  );
}
