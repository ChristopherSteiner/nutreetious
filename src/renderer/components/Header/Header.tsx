import { TitleBar } from './TitleBar';
import { ToolBar } from './ToolBar';

export function Header() {
  return (
    <div className="flex flex-col">
      <TitleBar />
      <ToolBar />
    </div>
  );
}