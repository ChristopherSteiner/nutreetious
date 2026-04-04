export const WindowService = {
  minimize(): void {
    window.electronAPI.minimize();
  },

  maximize(): void {
    window.electronAPI.maximize();
  },

  close(): void {
    window.electronAPI.close();
  },

  async selectAssetsFile(): Promise<string | null> {
    return await window.electronAPI.openFileDialog();
  },
};
