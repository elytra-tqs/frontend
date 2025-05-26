import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import ChargersList from "../../components/stations/ChargersList";
import NewChargerForm from "../../components/stations/NewChargerForm";
import {
  useChargers,
  ChargerStatus,
  type ChargerFormData,
} from "../../contexts/ChargersContext";
import { useStations } from "../../contexts/StationsContext";

const StationDetails = () => {
  const { stationId } = useParams();
  const { stations } = useStations();
  const {
    chargers,
    loading: chargersLoading,
    error: chargersError,
    fetchChargersByStation,
    addChargerToStation,
    updateChargerAvailability,
  } = useChargers();
  const [showNewChargerDialog, setShowNewChargerDialog] = useState(false);

  const station = stations.find((s) => s.id === Number(stationId));

  useEffect(() => {
    if (stationId) {
      fetchChargersByStation(Number(stationId));
    }
  }, [stationId]);

  const handleUpdateChargerStatus = async (
    chargerId: number,
    newStatus: ChargerStatus
  ) => {
    try {
      await updateChargerAvailability(chargerId, newStatus);
    } catch (error) {
      console.error(
        `Failed to update charger ${chargerId} status to ${newStatus}`,
        error
      );
    }
  };

  const handleAddCharger = async (
    stationId: number,
    chargerData: ChargerFormData
  ) => {
    try {
      await addChargerToStation(stationId, chargerData);
      setShowNewChargerDialog(false);
    } catch (error) {
      console.error("Failed to add charger", error);
    }
  };

  if (chargersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          Loading chargers...
        </div>
      </div>
    );
  }

  if (chargersError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64 text-red-500">
          Error: {chargersError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {station ? station.name : `Station ${stationId}`}
          </CardTitle>
          <Dialog
            open={showNewChargerDialog}
            onOpenChange={setShowNewChargerDialog}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Charger
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Charger</DialogTitle>
              </DialogHeader>
              <NewChargerForm
                stationId={Number(stationId)}
                onSubmit={handleAddCharger}
                onCancel={() => setShowNewChargerDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Click on a charger to view details and manage its status.
            </p>

            {chargers.length > 0 ? (
              <ChargersList
                chargers={chargers.map((c) => ({
                  id: c.id,
                  name: `Charger ${c.id}`,
                  type: c.type,
                  power: c.power,
                  status: c.status,
                }))}
                onUpdateChargerStatus={handleUpdateChargerStatus}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No chargers available for this station.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">{station?.address}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StationDetails;
