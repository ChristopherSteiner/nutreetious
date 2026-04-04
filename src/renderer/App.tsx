import { Header } from './components/Header/Header';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <Header />
      <main className="flex-1 overflow-hidden flex items-center justify-center">
        {/* Hier landet später der react-arborist Tree */}
        <div className="text-zinc-700 italic text-sm">
          Drop a project.assets.json or use the picker...
        </div>
      </main>
    </div>
  );
}

export default App;