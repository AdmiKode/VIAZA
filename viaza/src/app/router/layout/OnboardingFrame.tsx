import { Outlet } from 'react-router-dom';

export function OnboardingFrame() {
  return (
    <div className="min-h-dvh">
      <Outlet />
    </div>
  );
}

