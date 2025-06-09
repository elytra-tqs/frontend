import { useEffect, useState } from "react";
import { MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChargers, ChargerStatus } from "../contexts/ChargersContext";
import { useBookings } from "../contexts/BookingsContext";
import { BookingDialog } from "./BookingDialog";

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
  const { fetchBookingsByCharger } = useBookings();
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [chargerBookings, setChargerBookings] = useState<Array<{startTime: string; endTime: string}>>([]);

  useEffect(() => {
    if (station.id) {
      fetchChargersByStation(station.id);
    }
  }, [station.id]);

  
  const getStatusClass = (status: ChargerStatus): string => {
    switch (status) {
      case ChargerStatus.AVAILABLE:
        return "bg-green-500 text-white hover:bg-green-600";
      case ChargerStatus.BEING_USED:
        return "bg-blue-500 text-white hover:bg-blue-600";
      case ChargerStatus.UNDER_MAINTENANCE:
        return "bg-yellow-500 text-black hover:bg-yellow-600";
      case ChargerStatus.OUT_OF_SERVICE:
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
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

  const handleOpenBookingDialog = async (charger: Charger) => {
    setSelectedCharger(charger);
    try {
      const bookings = await fetchBookingsByCharger(charger.id);
      setChargerBookings(bookings);
    } catch (error) {
      console.error("Failed to fetch charger bookings:", error);
      setChargerBookings([]);
    }
    setIsBookingDialogOpen(true);
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
                <Badge className={getStatusClass(charger.status)}>
                  {getStatusText(charger.status)}
                </Badge>
              </div>
              <Button
                className="w-full -mt-5"
                disabled={charger.status !== ChargerStatus.AVAILABLE}
                onClick={() => handleOpenBookingDialog(charger)}
              >
                {charger.status === ChargerStatus.AVAILABLE ? "Book Now" : "Unavailable"}
              </Button>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {selectedCharger && (
        <BookingDialog
          isOpen={isBookingDialogOpen}
          onClose={() => {
            setIsBookingDialogOpen(false);
            setSelectedCharger(null);
            setChargerBookings([]);
          }}
          chargerId={selectedCharger.id}
          chargerInfo={{
            type: selectedCharger.type,
            power: selectedCharger.power,
            stationName: station.name
          }}
          existingBookings={chargerBookings}
        />
      )}
    </div>
  );
} 