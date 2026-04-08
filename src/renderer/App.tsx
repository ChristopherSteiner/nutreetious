import { Header } from './components/Header/Header';
import { MainWindow } from './components/Main/MainWindow';
import { NotificationDrawer } from './components/Notification/NotificationDrawer';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex overflow-hidden">
          <MainWindow />
          <NotificationDrawer />
        </div>
      </main>
    </div>
  );
}

export default App;
