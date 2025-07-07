import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";

export default function PricingSection() {
  const [additionalCards, setAdditionalCards] = useState(0);
  const additionalCardPrice = 79;

  const plans = [
    {
      name: "Starter",
      price: 89,
      unit: "/cartão",
      features: [
        "1 Cartão SlenoCard",
        "Configuração incluída",
        "Suporte via WhatsApp"
      ],
      popular: false
    },
    {
      name: "Negócio",
      price: 249,
      unit: "/pacote",
      features: [
        "3 Cartões SlenoCard",
        "Configuração incluída",
        "Suporte prioritário",
        "Economia de R$ 18"
      ],
      popular: false
    },
    {
      name: "Empresa",
      price: 699,
      unit: "/pacote",
      features: [
        "10 Cartões SlenoCard",
        "Configuração incluída",
        "Suporte premium",
        "Economia de R$ 191"
      ],
      popular: true
    }
  ];

  const increaseQuantity = () => {
    setAdditionalCards(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (additionalCards > 0) {
      setAdditionalCards(prev => prev - 1);
    }
  };

  return (
    <section id="planos" className="py-16 px-4 sm:px-6 lg:px-8 bg-slenocard-gray/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Escolha o plano ideal para o seu negócio</h2>
          <p className="text-xl text-slenocard-light">Pacotes pensados para diferentes tipos de estabelecimentos</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-slenocard-gray rounded-2xl p-8 relative transition-colors duration-200 ${
                plan.popular 
                  ? 'border-2 border-slenocard-orange' 
                  : 'border border-gray-600 hover:border-slenocard-orange'
              }`}
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
                <span className="text-lg text-slenocard-light">{plan.unit}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-slenocard-light">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-slenocard-orange mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className="w-full bg-slenocard-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
                Escolher Plano
              </button>
            </div>
          ))}
        </div>
        
        {/* Additional Cards Section */}
        <div className="bg-slenocard-gray border border-gray-600 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-center">Adicionar cartões avulsos</h3>
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={decreaseQuantity}
              className="w-12 h-12 bg-slenocard-orange hover:bg-orange-600 rounded-full flex items-center justify-center text-2xl font-bold transition-colors duration-200"
            >
              <Minus className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-3xl font-bold">{additionalCards}</div>
              <div className="text-slenocard-light">cartões</div>
            </div>
            <button
              onClick={increaseQuantity}
              className="w-12 h-12 bg-slenocard-orange hover:bg-orange-600 rounded-full flex items-center justify-center text-2xl font-bold transition-colors duration-200"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center mt-6">
            <div className="text-2xl font-bold">Total: R$ {additionalCards * additionalCardPrice}</div>
            <div className="text-slenocard-light">R$ {additionalCardPrice} por cartão adicional</div>
          </div>
        </div>
      </div>
    </section>
  );
}
