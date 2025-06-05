import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, AlertCircle, Clock, Link as LinkIcon } from "lucide-react";
import { useStations } from "../../contexts/StationsContext";
import { useChargers, ChargerStatus } from "../../contexts/ChargersContext";
import { useStationOperator } from "../../contexts/StationOperatorContext";
import NewChargerForm from "../../components/stations/NewChargerForm";
import { TimeSlotManager, type TimeSlot } from "../../components/stations/TimeSlotManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationLinker } from "../../components/stations/StationLinker";

function StationOperatorPage() {
  const { stations } = useStations();
  const { addChargerToStation, updateChargerAvailability, chargers, fetchChargersByStation } = useChargers();
  const { releaseStation } = useStationOperator();
  const [showNewChargerForm, setShowNewChargerForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    // Fetch chargers for the station when the component mounts
    if (stations.length > 0 && stations[0].id) {
      fetchChargersByStation(stations[0].id);
    }
  }, [stations, fetchChargersByStation]);

  // Initialize default time slots when chargers are loaded
  useEffect(() => {
    if (chargers.length > 0 && timeSlots.length === 0) {
      const defaultSlots: TimeSlot[] = [];
      
      chargers.forEach(charger => {
        // Morning slots (8:00-12:00)
        for (let i = 0; i < 5; i++) {
          defaultSlots.push({
            id: Math.random().toString(36).slice(2, 11),
            chargerId: charger.id,
            startTime: `${8 + i}:00`,
            endTime: `${9 + i}:00`,
            isAvailable: true
          });
        }
        
        // Afternoon slots (13:00-17:00)
        for (let i = 0; i < 5; i++) {
          defaultSlots.push({
            id: Math.random().toString(36).slice(2, 11),
            chargerId: charger.id,
            startTime: `${13 + i}:00`,
            endTime: `${14 + i}:00`,
            isAvailable: true
          });
        }
      });

      setTimeSlots(defaultSlots);
    }
  }, [chargers]);

  const handleUpdateStatus = async (stationId: string, newStatus: ChargerStatus) => {
    try {
      await updateChargerAvailability(Number(stationId), newStatus);
    } catch (err) {
      console.error(err);
      setError("Failed to update charger status. Please try again.");
    }
  };

  const handleAddCharger = async (stationId: number, chargerData: { type: string; power: number; status: ChargerStatus }) => {
    try {
      await addChargerToStation(stationId, chargerData);
      setShowNewChargerForm(false);
    } catch (err) {
      console.error(err);
      setError("Failed to add charger. Please try again.");
    }
  };

  const handleRemoveTimeSlot = (slotId: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
  };

  const handleToggleTimeSlotAvailability = (slotId: string) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const handleReleaseStation = async () => {
    try {
      await releaseStation();
    } catch (err) {
      console.error(err);
      setError("Failed to release station. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Operator Dashboard</h1>

      <div className="space-y-8">
        {/* Station Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Station</CardTitle>
            {stations.length > 0 && (
              <Button variant="outline" onClick={handleReleaseStation}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Release Station
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {stations.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {stations[0].name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {stations[0].address}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {stations[0].status ?? "available"}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">No station information available.</p>
                <StationLinker />
              </div>
            )}
          </CardContent>
        </Card>

        {stations.length > 0 && (
          <>
            {/* Main Content Tabs */}
            <Tabs defaultValue="chargers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chargers">Chargers</TabsTrigger>
                <TabsTrigger value="time-slots">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Slots
                </TabsTrigger>
              </TabsList>

              {/* Chargers Tab */}
              <TabsContent value="chargers">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Charging Stations</CardTitle>
                    {!showNewChargerForm && (
                      <Button size="sm" onClick={() => setShowNewChargerForm(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Charging Station
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                      </div>
                    )}

                    {showNewChargerForm ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Add New Charging Station</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {stations.length > 0 && (
                            <NewChargerForm
                              stationId={stations[0].id ?? 0}
                              onSubmit={handleAddCharger}
                              onCancel={() => setShowNewChargerForm(false)}
                            />
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {chargers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {chargers.map((charger) => {
                              let statusColor = "bg-red-100 text-red-800";
                              if (charger.status === ChargerStatus.AVAILABLE) {
                                statusColor = "bg-green-100 text-green-800";
                              } else if (charger.status === ChargerStatus.BEING_USED) {
                                statusColor = "bg-blue-100 text-blue-800";
                              } else if (charger.status === ChargerStatus.UNDER_MAINTENANCE) {
                                statusColor = "bg-yellow-100 text-yellow-800";
                              }
                              return (
                                <Card key={charger.id} className="hover:shadow-lg transition-shadow">
                                  <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-2">Charger {charger.id}</h3>
                                    <div className="space-y-2">
                                      <p className="text-sm">
                                        <span className="font-medium">Type:</span> {charger.type}
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium">Power:</span> {charger.power} kW
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium">Status:</span>{" "}
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusColor}`}>
                                          {charger.status.replace(/_/g, " ").toLowerCase()}
                                        </span>
                                      </p>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(charger.id.toString(), ChargerStatus.UNDER_MAINTENANCE)}
                                        disabled={charger.status === ChargerStatus.UNDER_MAINTENANCE}
                                      >
                                        Set Maintenance
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(charger.id.toString(), ChargerStatus.AVAILABLE)}
                                        disabled={charger.status === ChargerStatus.AVAILABLE}
                                      >
                                        Set Available
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No charging stations available.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Time Slots Tab */}
              <TabsContent value="time-slots">
                <TimeSlotManager
                  chargers={chargers}
                  slots={timeSlots}
                  onRemoveSlot={handleRemoveTimeSlot}
                  onToggleAvailability={handleToggleTimeSlotAvailability}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default StationOperatorPage;
  