import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardContent = () => {
    switch (user?.userType) {
      case 'EV_DRIVER':
        return {
          title: "EV Driver Dashboard",
          description: "Manage your charging sessions and vehicle information",
          actions: [
            { label: "Find Charging Stations", path: "/evdriver" },
            { label: "Manage My Cars", path: "/evdriver/add-car" },
          ]
        };
      case 'STATION_OPERATOR':
        return {
          title: "Station Operator Dashboard",
          description: "Monitor and manage your charging stations",
          actions: [
            { label: "View Stations", path: "/stations" },
            { label: "Station Overview", path: "/operator" },
          ]
        };
      case 'ADMIN':
        return {
          title: "Admin Dashboard",
          description: "System-wide management and monitoring",
          actions: [
            { label: "Manage Stations", path: "/admin/stations" },
            { label: "Admin Overview", path: "/admin" },
          ]
        };
      default:
        return {
          title: "Welcome",
          description: "Please select your role to continue",
          actions: []
        };
    }
  };

  const content = getDashboardContent();

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
        <p className="text-gray-600 mb-8">{content.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.actions.map((action) => (
            <Button
              key={action.path}
              variant="outline"
              className="h-24 text-lg"
              onClick={() => navigate(action.path)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
