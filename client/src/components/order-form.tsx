import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFieldArray } from "react-hook-form";
import type { PlanOption } from "@/components/pricing-section";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

// Declaração global para window.lojaPesquisada
// Padroniza o tipo global de window.lojaPesquisada igual ao search-section.tsx
declare global {
  interface Window {
    lojaPesquisada?: {
      nome: string;
      endereco: string;
      name: string;
      formatted_address: string;
      place_id: string;
      [key: string]: any;
    };
  }
}

const orderFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  documento: z.string().min(11, "CPF/CNPJ deve ter pelo menos 11 caracteres"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
  endereco_rua: z.string().min(2, "Rua obrigatória"),
  endereco_numero: z.string().min(1, "Número obrigatório"),
  endereco_complemento: z.string().optional(),
  endereco_bairro: z.string().min(2, "Bairro obrigatório"),
  endereco_cidade: z.string().min(2, "Cidade obrigatória"),
  endereco_estado: z.string().min(2, "Estado obrigatório"),
  endereco_cep: z.string().min(8, "CEP obrigatório"),
  itens: z
    .array(
      z.object({
        nome: z.string().min(2),
        quantidade: z.number().min(1),
        preco_unitario: z.number().min(0.01),
      })
    )
    .min(1, "Adicione pelo menos um item ao pedido"),
  loja_pesquisada: z
    .string()
    .min(2, "Selecione uma loja antes de finalizar o pedido"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

const PLAN_OPTIONS: PlanOption[] = [
  {
    name: "Starter",
    price: "49,90",
    unit: "/cartão",
    features: [
      "1 Cartão SlenoCard",
      "Configuração incluída",
      "Suporte via WhatsApp",
    ],
    popular: false,
    quantity: 1,
    total: 49.9,
  },
  {
    name: "Negócio",
    price: "119,90",
    unit: "/pacote",
    features: [
      "3 Cartões SlenoCard",
      "Configuração incluída",
      "Suporte prioritário",
      "Economia de R$ 29,80",
    ],
    popular: false,
    quantity: 3,
    total: 119.9,
  },
  {
    name: "Empresa",
    price: "299,90",
    unit: "/pacote",
    features: [
      "10 Cartões SlenoCard",
      "Configuração incluída",
      "Suporte premium",
      "Economia de R$ 199,10",
    ],
    popular: true,
    quantity: 10,
    total: 299.9,
  },
];

const OrderForm = forwardRef(function OrderForm(_, ref) {
  const [showLojaError, setShowLojaError] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>(PLAN_OPTIONS[0]);
  const [pixModal, setPixModal] = useState<{
    open: boolean;
    qrCode?: string;
    code?: string;
    total?: number;
  }>({ open: false });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      documento: "",
      telefone: "",
      endereco_rua: "",
      endereco_numero: "",
      endereco_complemento: "",
      endereco_bairro: "",
      endereco_cidade: "",
      endereco_estado: "",
      endereco_cep: "",
      itens: [],
      loja_pesquisada: "",
    },
  });

  // Sincroniza valor inicial ao montar
  useEffect(() => {
    if (window.lojaPesquisada && window.lojaPesquisada.nome) {
      form.setValue("loja_pesquisada", window.lojaPesquisada.nome);
    } else {
      form.setValue("loja_pesquisada", "");
    }
  }, []);

  // Sincroniza valor quando o evento é disparado
  useEffect(() => {
    function handleLojaPesquisadaChange() {
      if (window.lojaPesquisada && window.lojaPesquisada.nome) {
        form.setValue("loja_pesquisada", window.lojaPesquisada.nome);
      } else {
        form.setValue("loja_pesquisada", "");
      }
    }
    window.addEventListener("lojaPesquisadaChange", handleLojaPesquisadaChange);
    return () => {
      window.removeEventListener(
        "lojaPesquisadaChange",
        handleLojaPesquisadaChange
      );
    };
  }, [form]);

  // Adiciona manipulação dinâmica dos itens do pedido
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itens",
  });

  // Preenchimento automático de endereço pelo CEP
  useEffect(() => {
    const cep = form.watch("endereco_cep");
    if (cep && cep.replace(/\D/g, "").length === 8) {
      fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            form.setValue("endereco_rua", data.logradouro || "");
            form.setValue("endereco_bairro", data.bairro || "");
            form.setValue("endereco_cidade", data.localidade || "");
            form.setValue("endereco_estado", data.uf || "");
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("endereco_cep")]);

  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Criação do cliente na Appmax
      const clientePayload = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        endereco_rua: data.endereco_rua,
        endereco_numero: data.endereco_numero,
        endereco_complemento: data.endereco_complemento,
        endereco_bairro: data.endereco_bairro,
        endereco_cidade: data.endereco_cidade,
        endereco_estado: data.endereco_estado,
        endereco_cep: data.endereco_cep,
      };
      const clienteRes = await fetch("/api/appmax/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientePayload),
      });
      if (!clienteRes.ok) throw new Error("Erro ao criar cliente");
      const clienteResult = await clienteRes.json();
      const customer_id = clienteResult?.data?.id;
      if (!customer_id) throw new Error("customer_id não retornado");

      // 2. Criação do pedido na Appmax usando customer_id
      const pedidoPayload = {
        customer_id,
        produtos: [
          {
            sku:
              selectedPlan.name === "Starter"
                ? "CARD1"
                : selectedPlan.name === "Negócio"
                ? "CARD3"
                : "CARD10",
            quantidade: selectedPlan.quantity,
          },
        ],
        loja_pesquisada: window.lojaPesquisada,
      };
      const pedidoRes = await fetch("/api/appmax/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoPayload),
      });
      if (!pedidoRes.ok) {
        const errorData = await pedidoRes.json();
        if (errorData?.error?.includes("Selecione uma loja")) {
          setShowLojaError(true);
          toast({
            title: "Selecione uma loja!",
            description:
              "Você precisa escolher uma loja antes de finalizar o pedido.",
            variant: "destructive",
          });
          // Autoscroll para o campo de loja pesquisada
          const lojaField = document.getElementById("loja-pesquisada");
          if (lojaField) {
            lojaField.scrollIntoView({ behavior: "smooth", block: "center" });
            // Simula clique para abrir o dropdown de busca de loja
            lojaField.click();
          }
          return;
        }
        throw new Error(errorData?.error || "Erro ao criar pedido");
      }
      const pedidoResult = await pedidoRes.json();
      if (!pedidoResult.checkout_url)
        throw new Error("Link de checkout não retornado");
      window.location.href = pedidoResult.checkout_url;
    } catch (error: any) {
      toast({
        title: "Erro ao enviar pedido",
        description:
          error?.message || "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualiza o plano e os itens do pedido
  const setPlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
    form.setValue("itens", [
      {
        nome: `Cartão SlenoCard (${plan.name})`,
        quantidade: plan.quantity,
        preco_unitario: Number((plan.total / plan.quantity).toFixed(2)),
      },
    ]);
  };

  useImperativeHandle(ref, () => ({ setPlan }));

  // Atualiza os itens do pedido quando o usuário troca o plano pelo dropdown
  useEffect(() => {
    setPlan(selectedPlan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan]);

  return (
    <section id="pedido" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Falta pouco para você impulsionar suas avaliações!
          </h2>
          <p className="text-xl text-slenocard-light">
            Preencha seus dados e receba seu SlenoCard em casa
          </p>
        </div>
        {/* Dropdown de seleção de plano - agora no topo, centralizado e destacado */}
        <div className="flex flex-col items-center mb-8">
          <label className="block mb-2 font-semibold text-slenocard-orange text-lg">
            Escolha seu plano
          </label>
          <div className="w-full md:w-2/3 lg:w-1/2">
            <Select
              value={selectedPlan.name}
              onValueChange={(value) => {
                const plan = PLAN_OPTIONS.find((p) => p.name === value);
                if (plan) setSelectedPlan(plan);
              }}
            >
              <SelectTrigger className="h-14 rounded-xl border-2 border-slenocard-orange bg-slenocard-gray text-white text-base font-medium shadow-md focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all group relative w-full">
                <SelectValue placeholder="Selecione o plano" />
                {/* Seta customizada animada */}
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  data-state-open={undefined}
                >
                  <ChevronDown className="h-6 w-6" />
                </span>
              </SelectTrigger>
              <SelectContent
                className="rounded-xl border-2 border-slenocard-orange bg-slenocard-gray text-white shadow-lg mt-2"
                position="popper"
                side="bottom"
                align="start"
              >
                {PLAN_OPTIONS.map((plan) => (
                  <SelectItem
                    key={plan.name}
                    value={plan.name}
                    className="rounded-lg my-1 px-4 py-3 text-base font-medium cursor-pointer transition-colors data-[state=checked]:bg-slenocard-orange/80 data-[highlighted]:bg-slenocard-orange/40 hover:bg-slenocard-orange/30 focus:bg-slenocard-orange/40"
                  >
                    {plan.name} - {plan.quantity} cartão(s) - R${" "}
                    {plan.total.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Campo visual para loja pesquisada */}
        <div className="mb-8 flex flex-col items-center">
          <label
            htmlFor="loja-pesquisada"
            className="block mb-2 font-semibold text-slenocard-orange text-lg"
          >
            Loja pesquisada
          </label>
          <input
            id="loja-pesquisada"
            type="text"
            value={form.watch("loja_pesquisada")}
            readOnly
            className={`w-full md:w-2/3 lg:w-1/2 px-6 py-4 rounded-lg border text-white bg-slenocard-gray placeholder-gray-400 focus:outline-none transition-colors duration-200 ${
              form.formState.errors.loja_pesquisada || showLojaError
                ? "border-red-500"
                : "border-gray-600"
            }`}
            placeholder="Selecione a loja no campo acima"
            onFocus={() => {
              const searchSection = document.getElementById("search-section");
              if (searchSection) {
                searchSection.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }}
          />
          {/* Mensagem de erro fixa se loja não selecionada */}
          {showLojaError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2 text-center">
              Você precisa selecionar uma loja antes de finalizar o pedido.
            </div>
          )}
          {/* Fallback: se o campo estiver vazio mas window.lojaPesquisada existir, atualiza o campo */}
          {form.watch("loja_pesquisada") === "" &&
            window.lojaPesquisada?.nome && (
              <span className="text-yellow-400 text-sm mt-2">
                Sincronizando loja selecionada...
                {(() => {
                  form.setValue("loja_pesquisada", window.lojaPesquisada.nome);
                  return null;
                })()}
              </span>
            )}
          {form.formState.errors.loja_pesquisada && (
            <span className="text-red-500 text-sm mt-2">
              {form.formState.errors.loja_pesquisada.message}
            </span>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Sessão 1: Informações para Contato */}
            <div className="bg-slenocard-gray/60 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-slenocard-orange">
                Informações para Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
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
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF ou CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu CPF ou CNPJ"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="(11) 99999-9999"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sessão 2: Endereço para Entrega */}
            <div className="bg-slenocard-gray/60 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-slenocard-orange">
                Endereço para Entrega
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="endereco_cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="CEP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco_rua"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco_numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco_complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco_bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco_cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco_estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="Estado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sessão 2: Dados para Pagamento */}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slenocard-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isSubmitting ? "Enviando..." : "Finalizar Compra"}
            </Button>
            <p className="text-center text-sm text-slenocard-light mt-2">
              Seus dados estão seguros e protegidos. Entraremos em contato via
              WhatsApp para confirmar o pedido.
              {/* Modal Pix/Boleto */}
              {pixModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
                      onClick={() => setPixModal({ open: false })}
                    >
                      &times;
                    </button>
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <span role="img" aria-label="pix">
                          💠
                        </span>{" "}
                        Pagamento via PIX
                      </div>
                      <div className="text-center font-bold text-xl mb-2">
                        Seu pedido foi reservado!
                      </div>
                      <div className="text-center text-gray-600 mb-2">
                        Efetue o pagamento dentro de{" "}
                        <span className="font-semibold">00:29:55</span>
                      </div>
                      <div className="flex flex-row gap-4 items-center mb-2">
                        <ol className="text-sm text-left list-decimal pl-4">
                          <li>Clique no botão abaixo para copiar o código</li>
                          <li>
                            Abra o aplicativo do seu banco ou instituição
                            financeira e entre na opção Pix
                          </li>
                          <li>
                            Na opção Pix Copia e Cola, insira o código copiado
                            no passo 1
                          </li>
                        </ol>
                        {pixModal.qrCode && (
                          <img
                            src={pixModal.qrCode}
                            alt="QR Code Pix"
                            className="w-32 h-32 border rounded"
                          />
                        )}
                      </div>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded mb-2 flex items-center gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          if (pixModal.code) {
                            navigator.clipboard.writeText(pixModal.code);
                          }
                        }}
                      >
                        COPIAR CÓDIGO{" "}
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#fff"
                            d="M16 1a2 2 0 0 1 2 2v2h-2V3H6v14h2v2H6a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10Zm3 6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h9Zm0 2h-9v12h9V9Z"
                          />
                        </svg>
                      </button>
                      <div className="font-bold text-lg mt-2">
                        Total: R$ {pixModal.total?.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        Atenção: a confirmação do seu pagamento será enviada por
                        e-mail
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </p>
          </form>
        </Form>
      </div>
    </section>
  );
});

export default OrderForm;
