export const ALLOWED_EXTENSIONS = ['csproj', 'sln', 'slnx'];

export const FileProcessor = {
  getFilePath: (file: File): string => {
    return window.electronAPI.getFilePath(file);
  },

  isValidProjectFile: (path: string): boolean => {
    const ext = path.split('.').pop()?.toLowerCase();
    return !!ext && ALLOWED_EXTENSIONS.includes(ext);
  },

  getFileName: (path: string): string => {
    return path.split(/[\\/]/).pop() || path;
  },
};
