import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { type FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStations } from "../../contexts/StationsContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EditStationForm from "./EditStationForm";
import type { StationFormData } from "../../contexts/StationsContext";

interface Station {
  id: string;
  name: string;
  location: string;
  lastMaintenance?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  numberOfChargers: number;
}

interface StationsListProps {
  stations: Station[];
  onAddStation: () => void;
  isLoading?: boolean;
}

const StationsList: FC<StationsListProps> = ({
  stations,
  onAddStation,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { updateStation, deleteStation } = useStations();
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deletingStation, setDeletingStation] = useState<Station | null>(null);

  const handleEditStation = async (stationId: number, stationData: StationFormData) => {
    try {
      await updateStation(stationId, stationData);
      setEditingStation(null);
    } catch (error) {
      console.error("Failed to update station:", error);
    }
  };

  const handleDeleteStation = async (stationId: number) => {
    try {
      await deleteStation(stationId);
      setDeletingStation(null);
    } catch (error) {
      console.error("Failed to delete station:", error);
    }
  };

  if (isLoading && stations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading stations...
      </div>
    );
  }

  return (
    <div className="container mx-auto  ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Charging Stations</h1>
        <Button
          onClick={onAddStation}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus className="w-5 h-5" />
          Add Station
        </Button>
      </div>

      {stations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No charging stations found
          </p>
          <Button onClick={onAddStation}>Register Your First Station</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {stations.map((station) => (
            <Card key={station.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{station.name}</CardTitle>
                    <p className="text-muted-foreground">{station.location}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingStation(station)}
                      disabled={isLoading}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingStation(station)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/admin/stations/${station.id}`)}
                      disabled={isLoading}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingStation} onOpenChange={() => setEditingStation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Station</DialogTitle>
          </DialogHeader>
          {editingStation && (
            <EditStationForm
              stationId={Number(editingStation.id)}
              initialData={{
                name: editingStation.name,
                location: editingStation.location,
                coordinates: editingStation.coordinates,
              }}
              onSubmit={handleEditStation}
              onCancel={() => setEditingStation(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingStation} onOpenChange={() => setDeletingStation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Station</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingStation?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingStation(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingStation && handleDeleteStation(Number(deletingStation.id))}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationsList;
