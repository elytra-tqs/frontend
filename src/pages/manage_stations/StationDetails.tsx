import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChargersList from "../../components/stations/ChargersList";
import type { Charger, ChargerStatus } from "../../components/stations/ChargersList";
import { v4 as uuidv4 } from 'uuid';

const StationDetails = () => {
  const { stationId } = useParams();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock fetching chargers data
    const fetchChargers = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock data
        const mockChargers: Charger[] = [
          {
            id: uuidv4(),
            name: "Charger A1",
            type: "DC Fast Charging",
            power: 150,
            status: "available"
          },
          {
            id: uuidv4(),
            name: "Charger A2",
            type: "DC Fast Charging",
            power: 150,
            status: "in-use"
          },
          {
            id: uuidv4(),
            name: "Charger B1",
            type: "AC Level 2",
            power: 22,
            status: "maintenance"
          },
          {
            id: uuidv4(),
            name: "Charger B2",
            type: "AC Level 2",
            power: 22,
            status: "out-of-service"
          }
        ];
        
        setChargers(mockChargers);
        setIsLoading(false);
      }, 1000);
    };

    if (stationId) {
      fetchChargers();
    }
  }, [stationId]);

  const handleUpdateChargerStatus = (chargerId: string, newStatus: ChargerStatus) => {
    // In a real app, you would call an API here
    console.log(`Updating charger ${chargerId} status to ${newStatus}`);
    
    // Update local state
    setChargers(prev => 
      prev.map(charger => 
        charger.id === chargerId 
          ? { ...charger, status: newStatus } 
          : charger
      )
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          Loading chargers...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Chargers for Station {stationId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Click on a charger to view details and manage its status.
            </p>
            
            <ChargersList 
              stationId={stationId!} 
              chargers={chargers}
              onUpdateChargerStatus={handleUpdateChargerStatus}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationDetails;