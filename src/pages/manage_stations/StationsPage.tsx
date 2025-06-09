import StationsList from "../../components/stations/StationsList";
import NewStationForm from "../../components/stations/NewStationForm";
import StationDetails from "../../components/stations/StationDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, type FC } from "react";
import { useStations } from "../../contexts/StationsContext";
import type { StationFormData } from "../../contexts/StationsContext";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface StationListItem {
  id: string;
  name: string;
  location: string;
  status?: "available" | "maintenance" | "offline";
  lastMaintenance?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  numberOfChargers: number;
  operatorUsername?: string;
}

const StationsPage: FC = () => {
  const { user } = useAuth();
  const [showNewStationForm, setShowNewStationForm] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null
  );
  const { stations, registerStation, loading, error } = useStations();

  const addStation = async (stationData: StationFormData) => {
    try {
      await registerStation(stationData);
      setShowNewStationForm(false);
    } catch (err) {
      // Error is already handled in the context
      console.error("Error in component when adding station:", err);
    }
  };

  const stationsWithStringIds = stations.map((station) => ({
    id: station.id?.toString() || "",
    name: station.name,
    location: station.address,
    coordinates: {
      latitude: station.latitude || 0,
      longitude: station.longitude || 0,
    },
    status: station.status,
    lastMaintenance: station.lastMaintenance,
    numberOfChargers: 0, // Default value since it's not in the Station type
    operatorUsername: station.operatorUsername,
  })) as StationListItem[];

  if (loading && stations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pl-80">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {showNewStationForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Register New Station</CardTitle>
            </CardHeader>
            <CardContent>
              <NewStationForm
                onSubmit={addStation}
                onCancel={() => setShowNewStationForm(false)}
              />
            </CardContent>
          </Card>
        ) : selectedStationId ? (
          <StationDetails
            stationId={selectedStationId}
            onClose={() => setSelectedStationId(null)}
          />
        ) : (
          <StationsList
            stations={stationsWithStringIds}
            onAddStation={() => setShowNewStationForm(true)}
            isLoading={loading}
            canAddStation={user?.userType === "ADMIN"}
          />
        )}
      </div>
    </div>
  );
};

export default StationsPage;
