import { useState } from 'react';
import { FileProcessor } from '../../services';
import { useProjectStore } from '../../store';
import { Overlay } from './Overlay';
import { TreeContainer } from './TreeContainer';

const ALLOWED_EXTENSIONS = ['csproj', 'sln', 'slnx'];

export function MainWindow() {
  const [isDragging, setIsDragging] = useState(false);
  const { setProjectFromPath, isLoading } = useProjectStore();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const path = FileProcessor.getFilePath(file);
      await setProjectFromPath(path);
    }
  };

  return (
    <section
      className="relative flex-1 flex flex-col min-h-0"
      aria-label="Main Window"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Overlay isDragging={isDragging} isLoading={isLoading} />

      <div className="flex-1 flex flex-col overflow-auto p-2">
        <TreeContainer />
      </div>
    </section>
  );
}
