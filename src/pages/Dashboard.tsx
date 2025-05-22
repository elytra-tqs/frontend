import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Dashboard() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Elytra</h1>
      <p className="text-xl mb-12">Please select your interface:</p>
      
      <div className="flex gap-8">
        <Link to="/evdriver">
          <Button size="lg" variant="default" className="h-24 w-48 text-lg">
            EV Driver
          </Button>
        </Link>
        
        <Link to="/operator">
          <Button size="lg" variant="default" className="h-24 w-48 text-lg">
            Operator
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;