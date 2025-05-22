import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function EVDriverPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">EV Driver Dashboard</h1>
        <Link to="/">
          <Button variant="outline">Back to Main Menu</Button>
        </Link>
      </div>
      
      <div className="p-12 border rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground text-lg">No content available yet for the EV Driver interface.</p>
      </div>
    </div>
  );
}

export default EVDriverPage; 