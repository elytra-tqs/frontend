import StationsList from '../../components/stations/StationsList';
import NewStationForm from '../../components/stations/NewStationForm';
import StationDetails from '../../components/stations/StationDetails';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';
import { useState, type FC } from 'react';
const StationsPage: FC = () => {
  const [showNewStationForm, setShowNewStationForm] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [stations, setStations] = useState<any[]>([]);

  const addStation = (stationData: any) => {
    setStations(prev => [
      ...prev,
      { ...stationData, id: uuidv4(), status: 'available', lastMaintenance: new Date().toISOString() }
    ]);
    setShowNewStationForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
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
          <StationsList stations={stations} onAddStation={() => setShowNewStationForm(true)} />
        )}
      </div>
    </div>
  );
};

export default StationsPage; 