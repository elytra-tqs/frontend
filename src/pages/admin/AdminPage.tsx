import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookingsList } from "@/components/BookingsList";

function AdminPage() {
  const [isBookingsDialogOpen, setIsBookingsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-4 pt-24 pl-80">
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

        <button 
          onClick={() => setIsBookingsDialogOpen(true)} 
          className="block text-left"
        >
          <div className="border rounded-lg p-6 hover:bg-muted transition-colors">
            <h2 className="text-xl font-semibold mb-2">View All Bookings</h2>
            <p className="text-muted-foreground">
              Monitor and manage all system bookings
            </p>
          </div>
        </button>

        {/* Additional admin features can be added here */}
      </div>

      <Dialog open={isBookingsDialogOpen} onOpenChange={setIsBookingsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All System Bookings</DialogTitle>
            <DialogDescription>
              View and manage all bookings across the system
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <BookingsList showAllBookings />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminPage;
