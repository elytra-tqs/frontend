import { useEffect } from "react";
import { MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChargers, ChargerStatus } from "../contexts/ChargersContext";

interface Charger {
  id: number;
  type: string;
  power: number;
  status: ChargerStatus;
  stationId: number;
}

interface Station {
  id?: number;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  chargerTypes?: string[];
  status?: "available" | "maintenance" | "offline";
  lastMaintenance?: string;
  numberOfChargers?: number;
  chargers?: Charger[];
}

export function StationPopup({ station }: Readonly<{ station: Station }>) {
  const { loading: chargersLoading, fetchChargersByStation } = useChargers();

  useEffect(() => {
    if (station.id) {
      fetchChargersByStation(station.id);
    }
  }, [station.id]);

  const getStatusColor = (status: ChargerStatus): string => {
    switch (status) {
      case ChargerStatus.AVAILABLE:
        return "bg-green-500";
      case ChargerStatus.BEING_USED:
        return "bg-blue-500";
      case ChargerStatus.UNDER_MAINTENANCE:
        return "bg-yellow-500";
      case ChargerStatus.OUT_OF_SERVICE:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: ChargerStatus): string => {
    switch (status) {
      case ChargerStatus.AVAILABLE:
        return "Available";
      case ChargerStatus.BEING_USED:
        return "In Use";
      case ChargerStatus.UNDER_MAINTENANCE:
        return "Maintenance";
      case ChargerStatus.OUT_OF_SERVICE:
        return "Out of Service";
      default:
        return status;
    }
  };

  if (chargersLoading) {
    return (
      <div className="w-64 p-4 text-center">
        <p>Loading chargers...</p>
      </div>
    );
  }

  return (
    <div className="w-64">
      <h3 className="font-semibold text-lg -mb-3">{station.name}</h3>
      <p className="text-xs text-gray-600 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {station.address}
      </p>
      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-2">
          {station.chargers?.map((charger) => (
            <Card key={charger.id} className="p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">Charger {charger.id}</h4>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{charger.type} | </span>
                    <div className="flex items-center gap-1">
                      <div> </div>
                      <Zap className="w-3 h-3" />
                      <span>{charger.power} kW</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(charger.status)}>
                  {getStatusText(charger.status)}
                </Badge>
              </div>
              <Button
                className="w-full -mt-5"
                disabled={charger.status !== ChargerStatus.AVAILABLE}
                onClick={() => {
                  // implement booking functionality
                  console.log("Book charger:", charger.id);
                }}
              >
                {charger.status === ChargerStatus.AVAILABLE ? "Book Now" : "Unavailable"}
              </Button>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 