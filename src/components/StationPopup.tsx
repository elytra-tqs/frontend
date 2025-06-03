import { useEffect, useState } from "react";
import { MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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

interface TimeSlot {
  time: string;
  isOccupied: boolean;
}

export function StationPopup({ station }: Readonly<{ station: Station }>) {
  const { loading: chargersLoading, fetchChargersByStation } = useChargers();
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const morningSlots: TimeSlot[] = Array.from({ length: 5 }, (_, i) => ({
    time: `${8 + i}:00`,
    isOccupied: Math.random() > 0.7, 
  }));

  const afternoonSlots: TimeSlot[] = Array.from({ length: 5 }, (_, i) => ({
    time: `${13 + i}:00`,
    isOccupied: Math.random() > 0.7, 
  }));

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
                  setSelectedCharger(charger);
                  setIsBookingDialogOpen(true);
                }}
              >
                {charger.status === ChargerStatus.AVAILABLE ? "Book Now" : "Unavailable"}
              </Button>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Book Charger {selectedCharger?.id} - {selectedCharger?.type}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="morning" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="morning">Morning</TabsTrigger>
              <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
            </TabsList>
            <TabsContent value="morning" className="space-y-4">
              {morningSlots.map((slot) => (
                <div key={slot.time} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{slot.time}</span>
                    <Label
                      className={slot.isOccupied ? "text-red-500" : "text-green-500"}
                    >
                      {slot.isOccupied ? "Occupied" : "Free"}
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    disabled={slot.isOccupied}
                    onClick={() => {
                      console.log(`Booking charger ${selectedCharger?.id} for ${slot.time}`);
                      setIsBookingDialogOpen(false);
                    }}
                  >
                    Book
                  </Button>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="afternoon" className="space-y-4">
              {afternoonSlots.map((slot) => (
                <div key={slot.time} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{slot.time}</span>
                    <Label
                      className={slot.isOccupied ? "text-red-500" : "text-green-500"}
                    >
                      {slot.isOccupied ? "Occupied" : "Free"}
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    disabled={slot.isOccupied}
                    onClick={() => {
                      console.log(`Booking charger ${selectedCharger?.id} for ${slot.time}`);
                      setIsBookingDialogOpen(false);
                    }}
                  >
                    Book
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
} 