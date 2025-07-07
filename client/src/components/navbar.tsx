import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-slenocard-dark/95 backdrop-blur-sm border-b border-slenocard-gray z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-slenocard-orange">SlenoCard</div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="hover:text-slenocard-orange transition-colors duration-200"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection('planos')}
                className="hover:text-slenocard-orange transition-colors duration-200"
              >
                Planos
              </button>
              <button
                onClick={() => scrollToSection('pedido')}
                className="bg-slenocard-orange hover:bg-orange-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Peça o Seu
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-slenocard-orange"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slenocard-gray rounded-lg mt-2">
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="block px-3 py-2 text-base font-medium hover:text-slenocard-orange transition-colors duration-200 w-full text-left"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection('planos')}
                className="block px-3 py-2 text-base font-medium hover:text-slenocard-orange transition-colors duration-200 w-full text-left"
              >
                Planos
              </button>
              <button
                onClick={() => scrollToSection('pedido')}
                className="block px-3 py-2 text-base font-medium bg-slenocard-orange hover:bg-orange-600 rounded-lg transition-colors duration-200 w-full text-left"
              >
                Peça o Seu
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
