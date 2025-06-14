import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, AlertCircle, Link as LinkIcon, Calendar } from "lucide-react";
import { useChargers, ChargerStatus } from "../../contexts/ChargersContext";
import { useStationOperator } from "../../contexts/StationOperatorContext";
import NewChargerForm from "../../components/stations/NewChargerForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationLinker } from "../../components/stations/StationLinker";
import { BookingsList } from "../../components/BookingsList";

function StationOperatorPage() {
  const { availableStations, claimedStation, claimStation, releaseStation, fetchAvailableStations, fetchClaimedStation } = useStationOperator();
  const { addChargerToStation, updateChargerAvailability, chargers, fetchChargersByStation } = useChargers();
  const [showNewChargerForm, setShowNewChargerForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available stations and claimed station on initial mount
    fetchAvailableStations();
    fetchClaimedStation();
  }, [fetchAvailableStations, fetchClaimedStation]);

  useEffect(() => {
    // Fetch chargers when claimed station changes
    if (claimedStation?.id) {
      fetchChargersByStation(claimedStation.id);
    }
  }, [claimedStation, fetchChargersByStation]);


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
      // Refresh chargers after adding a new one
      if (claimedStation?.id) {
        fetchChargersByStation(claimedStation.id);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add charger. Please try again.");
    }
  };


  const handleReleaseStation = async () => {
    try {
      await releaseStation();
    } catch (err) {
      console.error(err);
      setError("Failed to release station. Please try again.");
    }
  };

  const handleClaimStation = async (stationId: number) => {
    try {
      await claimStation(stationId);
    } catch (err) {
      console.error(err);
      setError("Failed to claim station. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-8 pt-24 pl-80">
      <h1 className="text-2xl font-bold mb-8">Operator Dashboard</h1>

      <div className="space-y-8">
        {/* Station Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Station</CardTitle>
            {claimedStation && (
              <Button variant="outline" onClick={handleReleaseStation}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Release Station
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {claimedStation ? (
              <div className="space-y-4">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {claimedStation.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {claimedStation.address}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {claimedStation.status ?? "available"}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">No station claimed yet.</p>
                <StationLinker 
                  stations={availableStations}
                  onClaimStation={handleClaimStation}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {claimedStation && (
          <>
            {/* Main Content Tabs */}
            <Tabs defaultValue="chargers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chargers">Chargers</TabsTrigger>
                <TabsTrigger value="bookings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings
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
                          <NewChargerForm
                            stationId={claimedStation.id}
                            onSubmit={handleAddCharger}
                            onCancel={() => setShowNewChargerForm(false)}
                          />
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


              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Station Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {chargers.length > 0 ? (
                        chargers.map((charger) => (
                          <div key={charger.id}>
                            <h3 className="text-lg font-semibold mb-3">
                              Charger {charger.id} - {charger.type} ({charger.power} kW)
                            </h3>
                            <BookingsList chargerId={charger.id} compact />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No chargers available to show bookings.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

export default StationOperatorPage;
  