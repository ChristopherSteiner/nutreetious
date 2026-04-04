import { NotificationToast } from './components/Common';
import { Header } from './components/Header/Header';
import { MainWindow } from './components/Main/MainWindow';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <NotificationToast />
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <MainWindow />
      </main>
    </div>
  );
}

export default App;
