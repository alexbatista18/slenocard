export default function Hero() {
  const scrollToPlans = () => {
    const element = document.getElementById('planos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="mb-12 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transforme Clientes Satisfeitos em{" "}
              <span className="text-slenocard-orange">Avaliações 5 Estrelas</span>
            </h1>
            <p className="text-xl text-slenocard-light mb-8 leading-relaxed">
              Com o SlenoCard, sua empresa no topo do Google. A forma mais fácil e rápida para seus clientes deixarem uma avaliação positiva.
            </p>
            <button
              onClick={scrollToPlans}
              className="bg-slenocard-orange hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Peça já o seu
            </button>
          </div>
          <div className="flex justify-center lg:justify-end">
            {/* Product Mockup */}
            <div className="relative">
              <div className="w-80 h-48 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-300">
                <div className="absolute inset-4 flex flex-col justify-center items-center">
                  {/* Google logo representation */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 via-red-400 via-yellow-400 to-green-400 mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">G</span>
                  </div>
                  {/* 5 stars */}
                  <div className="flex space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-6 h-6 text-yellow-400">★</div>
                    ))}
                  </div>
                  {/* SlenoCard branding */}
                  <div className="text-slenocard-orange font-bold text-lg">SlenoCard</div>
                </div>
                {/* NFC symbol */}
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-slenocard-orange rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-slenocard-orange rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
