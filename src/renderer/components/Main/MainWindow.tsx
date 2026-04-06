import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FileProcessor } from '../../services';
import { useProjectStore } from '../../store';
import { NotificationToast } from '../Common';
import { Overlay } from './Overlay';
import { TreeContainer } from './TreeContainer';

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
    <DndProvider backend={HTML5Backend}>
      <section
        className="relative flex-1 flex flex-col min-h-0"
        aria-label="Main Window"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <NotificationToast />
        <Overlay isDragging={isDragging} isLoading={isLoading} />

        <div className="flex-1 flex flex-col overflow-auto p-2">
          <TreeContainer />
        </div>
      </section>
    </DndProvider>
  );
}
