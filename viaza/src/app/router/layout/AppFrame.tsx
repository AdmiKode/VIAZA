import { Outlet } from 'react-router-dom';
import { BottomNav } from '../../../components/ui/BottomNav';

export function AppFrame() {
  return (
    <div className="min-h-dvh pb-32">
      <Outlet />
      <BottomNav />
    </div>
  );
}

