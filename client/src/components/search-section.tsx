import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

type PlaceResult = {
  name: string;
  formatted_address: string;
  place_id: string;
};

export default function SearchSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchPlaces = async (term: string) => {
    if (!term) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/places?query=${encodeURIComponent(term)}`);

      // Adicione uma verificação para garantir que a resposta é OK antes de tentar o .json()
      if (!res.ok) {
        // Isso vai nos dar uma mensagem de erro mais clara se algo der errado
        throw new Error(`Erro na rede: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();

      if (data.status === "OK") {
        setResults(data.results);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
        // Opcional: Logar o erro retornado pela API do Google
        console.error(
          "Erro da API do Google:",
          data.error_message || data.status
        );
      }
    } catch (err) {
      console.error("Erro na busca:", err);
      setResults([]);
      setShowDropdown(false);
    }
  };

  // Efeito para fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    // Adiciona o listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove o listener ao desmontar o componente
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Debounce da busca
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchPlaces(searchTerm);
    }, 500); // 500ms delay
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [searchTerm]);

  const handleSelect = (name: string) => {
    setSearchTerm(name);
    setSelectedPlace(name);
    setShowDropdown(false);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">
          Veja a mágica acontecer com sua empresa
        </h2>
        <div className="relative flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Digite o nome da sua empresa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              className="w-full px-6 py-4 rounded-lg bg-slenocard-gray border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-slenocard-orange transition-colors duration-200"
            />
            {/* Expor loja pesquisada para o OrderForm via window/global (simples) */}
            {selectedPlace && (
              <script>
                {`window.lojaPesquisada = ${JSON.stringify(selectedPlace)};`}
              </script>
            )}
            {showDropdown && results.length > 0 && (
              <ul
                className="absolute z-10 mt-1 w-full rounded-lg shadow-lg text-left max-h-60 overflow-y-auto 
               bg-slenocard-gray border border-gray-600 text-white"
              >
                {results.slice(0, 5).map((place) => (
                  <li
                    key={place.place_id}
                    onClick={() => handleSelect(place.name)}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                  >
                    {place.name} - {place.formatted_address}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => fetchPlaces(searchTerm)}
            className="bg-slenocard-orange hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </div>
        <p className="text-slenocard-light mt-4 text-sm">
          Esta ferramenta mostrará como o SlenoCard pode transformar sua
          presença online
        </p>
      </div>
    </section>
  );
}
