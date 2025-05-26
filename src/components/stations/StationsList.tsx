import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { type FC } from "react";
import { useNavigate } from "react-router-dom";

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

  if (isLoading && stations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading stations...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                      onClick={() => navigate(`/stations/${station.id}`)}
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
    </div>
  );
};

export default StationsList;
