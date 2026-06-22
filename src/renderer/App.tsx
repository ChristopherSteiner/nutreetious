import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header/Header';
import { MainWindow } from './components/Main/MainWindow';
import { NotificationDrawer } from './components/Notification/NotificationDrawer';
import { SettingsModal } from './components/Settings';
import { useUserSettingStore } from './store/useUserSettingStore';

function App() {
  const { i18n } = useTranslation();
  const { settings, isLoaded, loadSettings } = useUserSettingStore();

  useEffect(() => {
    if (!isLoaded) {
      loadSettings();
    }
  }, [isLoaded, loadSettings]);

  useEffect(() => {
    if (settings) {
      i18n.changeLanguage(settings.appearance.language);
    }
  }, [settings, i18n]);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex overflow-hidden">
          <MainWindow />
          <NotificationDrawer />
        </div>
      </main>
      <SettingsModal />
    </div>
  );
}

export default App;
