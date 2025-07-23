import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useRef } from "react";

export default function PricingSection({ onSelectPlan }: { onSelectPlan?: (plan: PlanOption) => void }) {
  const [additionalCards, setAdditionalCards] = useState(0);
  const additionalCardPrice = 49.9;

  const plans = [
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

  const formSectionRef = useRef<HTMLElement | null>(null);

  // Função para scrollar até o formulário e setar o plano
  const handleChoosePlan = (plan: typeof plans[0]) => {
    if (onSelectPlan) onSelectPlan(plan);
    const formSection = document.getElementById("pedido");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const increaseQuantity = () => {
    setAdditionalCards((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (additionalCards > 0) {
      setAdditionalCards((prev) => prev - 1);
    }
  };

  return (
    <section
      id="planos"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-slenocard-gray/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Escolha o plano ideal para o seu negócio
          </h2>
          <p className="text-xl text-slenocard-light">
            Pacotes pensados para diferentes tipos de estabelecimentos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-slenocard-gray rounded-2xl p-8 relative transition-colors duration-200 ${
                plan.popular
                  ? "border-2 border-slenocard-orange"
                  : "border border-gray-600 hover:border-slenocard-orange"
              } flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-slenocard-orange text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">
                R$ <span>{plan.price}</span>
                <span className="text-lg text-slenocard-light">
                  {plan.unit}
                </span>
              </div>

              <ul className="space-y-3 mb-8 text-slenocard-light flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-slenocard-orange mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleChoosePlan(plan)}
                className="w-full bg-slenocard-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 text-center block"
              >
                Escolher Plano
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type PlanOption = {
  name: string;
  price: string;
  unit: string;
  features: string[];
  popular: boolean;
  quantity: number;
  total: number;
};
