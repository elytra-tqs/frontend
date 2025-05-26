import React from 'react';
import { Outlet } from 'react-router-dom';
import AppBreadcrumb from '../navigation/AppBreadcrumb';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppBreadcrumb />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout; 