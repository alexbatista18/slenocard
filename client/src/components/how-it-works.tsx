import { Zap, CheckCircle, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Zap className="w-10 h-10 text-white" />,
      title: "Aproxime",
      description: "Seu cliente aproxima o celular do SlenoCard"
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-white" />,
      title: "Avalie",
      description: "O link de avaliação da sua empresa abre instantaneamente"
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-white" />,
      title: "Cresça",
      description: "Sua reputação online e suas vendas aumentam"
    }
  ];

  return (
    <section id="como-funciona" className="py-16 px-4 sm:px-6 lg:px-8 bg-slenocard-gray/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Receber uma avaliação nunca foi tão simples</h2>
          <p className="text-xl text-slenocard-light">Em apenas 3 passos simples, seus clientes deixam avaliações 5 estrelas</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-slenocard-orange rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-200">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-slenocard-light">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
