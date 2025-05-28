import { Link } from "react-router-dom";

function AdminPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/stations" className="block">
          <div className="border rounded-lg p-6 hover:bg-muted transition-colors">
            <h2 className="text-xl font-semibold mb-2">Manage Stations</h2>
            <p className="text-muted-foreground">
              View, add, and manage charging stations
            </p>
          </div>
        </Link>

        {/* Additional admin features can be added here */}
      </div>
    </div>
  );
}

export default AdminPage;
