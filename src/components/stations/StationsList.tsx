import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useState, type FC } from 'react';
interface Station {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'maintenance' | 'offline';
  lastMaintenance: string;
}

interface StationsListProps {
  stations: Station[];
  onAddStation: () => void;
}

const StationsList: FC<StationsListProps> = ({ stations, onAddStation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: Station['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'maintenance':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading stations...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Charging Stations</h1>
        <Button
          onClick={onAddStation}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Station
        </Button>
      </div>

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
                  {getStatusIcon(station.status)}
                  <span className="capitalize">{station.status}</span>
                  <Button
                    variant="ghost"
                    onClick={() => {/* TODO: Implement station details view */}}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StationsList; 