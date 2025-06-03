import { Outlet, Link } from "react-router-dom";
import AppBreadcrumb from "../navigation/AppBreadcrumb";
import { Sidebar, SidebarProvider, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Home, Settings, MapPin } from "lucide-react";

function SidebarHeaderContent() {
  const { state } = useSidebar();
  
  return (
    <div className="flex items-center gap-2">
      <img src="/elytra.png" alt="Elytra Logo" className="w-6 h-6 -ml-1" />
      {state === "expanded" && <h2 className="text-lg font-semibold">Elytra</h2>}
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="h-screen bg-background flex w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4">
            <SidebarHeaderContent />
          </SidebarHeader>
          <SidebarContent className="pt-4">
            <SidebarMenu className="px-2">
              <SidebarMenuButton asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Placeholder
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <MapPin className="w-4 h-4 mr-2" />
                  Placeholder
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <Settings className="w-4 h-4 mr-2" />
                  Placeholder
                </Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <div className="relative z-[1002] pointer-events-none">
            <div className="pointer-events-auto flex items-start gap-4 px-4 py-2 w-[50%]">
              <div className="flex items-start py-2">
                <SidebarTrigger className="hover:bg-sidebar hover:text-sidebar-foreground" />
              </div>
              <div className="flex items-start">
                <AppBreadcrumb />
              </div>
            </div>
          </div>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
