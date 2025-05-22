import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function OperatorPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Operator Dashboard</h1>
        <Link to="/">
          <Button variant="outline">Back to Main Menu</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/operator/stations" className="block">
          <div className="border rounded-lg p-6 hover:bg-muted transition-colors">
            <h2 className="text-xl font-semibold mb-2">Manage Stations</h2>
            <p className="text-muted-foreground">View, add, and manage charging stations</p>
          </div>
        </Link>
        
        {/* Additional operator features can be added here */}
      </div>
    </div>
  );
}

export default OperatorPage; 