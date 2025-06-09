import { Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout() {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (userType: string) => {
    switch (userType) {
      case 'ADMIN':
        return 'Administrator';
      case 'STATION_OPERATOR':
        return 'Station Operator';
      case 'EV_DRIVER':
        return 'EV Driver';
      default:
        return userType.replace('_', ' ').toLowerCase();
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Logo and User Card Container */}
      <div className="absolute top-4 left-4 z-[1003] space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/elytra.png" alt="Elytra Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold">Elytra</h1>
        </div>
        
        {/* User Profile Card */}
        {user && (
          <Card className="w-64 shadow-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{getRoleDisplayName(user.userType)}</span>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="destructive"
                className="w-full"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
