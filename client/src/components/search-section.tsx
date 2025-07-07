import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchSection() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    // This is a visual element as specified in requirements
    console.log("Search for:", searchTerm);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">Veja a mágica acontecer com sua empresa</h2>
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Digite o nome da sua empresa"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-6 py-4 rounded-lg bg-slenocard-gray border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-slenocard-orange transition-colors duration-200"
          />
          <button
            onClick={handleSearch}
            className="bg-slenocard-orange hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </div>
        <p className="text-slenocard-light mt-4 text-sm">Esta ferramenta mostrará como o SlenoCard pode transformar sua presença online</p>
      </div>
    </section>
  );
}
