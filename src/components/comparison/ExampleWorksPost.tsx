// src/components/comparison/ExampleWorksPost.tsx
import React from 'react';
import { NotebookPen } from 'lucide-react';

const ExampleWorksPost = () => {
  return (
    <div className="relative w-full h-[1200px] bg-gradient-to-br from-blue-700 to-blue-900 p-8">
      {/* Efekty świetlne w tle */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
      </div>

      {/* Logo i nagłówek */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center text-2xl font-bold text-white">
          <NotebookPen className="w-8 h-8 mr-2 text-blue-300" />
          Smart-Edu.AI
        </div>
      </div>

      {/* Główny nagłówek */}
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Od wypracowania po pracę magisterską
        </h1>
        <p className="text-2xl text-blue-200">
          Zobacz przykładowe prace stworzone przez Smart-Edu.AI!
        </p>
      </div>

      {/* Grid z przykładami */}
      <div className="relative z-10 grid grid-cols-2 gap-8 mb-12">
        {/* Lewa kolumna */}
        <div className="space-y-8">
          {/* Przykład 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-xl">
                📚
              </div>
              <h3 className="text-xl font-bold text-white">
                Wypracowanie z polskiego
              </h3>
            </div>
            <div className="h-32 bg-gray-800/50 rounded-lg mb-4">
              {/* Miejsce na screenshot */}
            </div>
            <p className="text-blue-100 text-sm">
              "Charakterystyka Bilbo Bagginsa" - 500 słów
            </p>
          </div>

          {/* Przykład 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-xl">
                🧪
              </div>
              <h3 className="text-xl font-bold text-white">
                Referat z biologii
              </h3>
            </div>
            <div className="h-32 bg-gray-800/50 rounded-lg mb-4">
              {/* Miejsce na screenshot */}
            </div>
            <p className="text-blue-100 text-sm">
              "Wpływ azotu na wzrost roślin" - 1200 słów
            </p>
          </div>
        </div>

        {/* Prawa kolumna */}
        <div className="space-y-8">
          {/* Przykład 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-xl">
                🎓
              </div>
              <h3 className="text-xl font-bold text-white">
                Praca licencjacka
              </h3>
            </div>
            <div className="h-32 bg-gray-800/50 rounded-lg mb-4">
              {/* Miejsce na screenshot */}
            </div>
            <p className="text-blue-100 text-sm">
              "System emerytalny w USA" - 2500 słów
            </p>
          </div>

          {/* Przykład 4 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center text-xl">
                📊
              </div>
              <h3 className="text-xl font-bold text-white">Projekt badawczy</h3>
            </div>
            <div className="h-32 bg-gray-800/50 rounded-lg mb-4">
              {/* Miejsce na screenshot */}
            </div>
            <p className="text-blue-100 text-sm">
              "Badanie zawartości witaminy C" - 1800 słów
            </p>
          </div>
        </div>
      </div>

      {/* Dolny panel z informacjami */}
      <div className="relative z-10">
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
            <span className="text-white">📝 250-2500 słów</span>
          </div>
          <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
            <span className="text-white">⚡️ 5 minut</span>
          </div>
          <div className="bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
            <span className="text-white">💰 3,99 zł/150 słów</span>
          </div>
        </div>

        <div className="text-center text-white text-xl">
          <p>Wypróbuj za darmo na Smart-Edu.AI</p>
          <p className="text-blue-200 mt-2">
            Dołącz do zadowolonych uczniów i studentów!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExampleWorksPost;
