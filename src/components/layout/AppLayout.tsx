import { Outlet } from "react-router-dom";
import AppBreadcrumb from "../navigation/AppBreadcrumb";

export function AppLayout() {
  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="relative z-[1002] pointer-events-none">
        <div className="pointer-events-auto">
          <AppBreadcrumb />
        </div>
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
