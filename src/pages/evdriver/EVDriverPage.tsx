import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Circle } from "react-leaflet";
import { ChevronDown, MapPin, Navigation, Car, Plus, Calendar, Filter, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStations } from "../../contexts/StationsContext";
import { ChargerStatus } from "../../contexts/ChargersContext";
import { StationPopup } from "@/components/StationPopup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCars } from "../../contexts/CarsContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { userIcon, stationIcon } from "@/lib/mapIcons";
import { getCurrentPosition, handleGeolocationError, getDistance } from "@/lib/geolocation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookingsList } from "@/components/BookingsList";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const mapStyles = `
  .leaflet-top.leaflet-left .leaflet-control-zoom {
    display: none !important;
  }
`;

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


function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);

  return null;
}

function EVDriverPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isBookingsDialogOpen, setIsBookingsDialogOpen] = useState(false);
  const [showDistanceRadius, setShowDistanceRadius] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const { stations: rawStations, loading: stationsLoading, error: stationsError } = useStations();
  const stations = rawStations as Station[];
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 means no limit
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [chargerTypeFilter, setChargerTypeFilter] = useState<string>("all");
  const allChargerTypes = ["Type 1", "Type 2", "CCS", "CHAdeMO", "Tesla"];
  const sliderRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { cars, loading: carsLoading, fetchCarsByDriver, error: carsError } = useCars();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    getCurrentPosition({
      onSuccess: (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      onError: (error) => {
        alert(handleGeolocationError(error));
      }
    });
  }, []);

  // Fetch driver ID and cars when user is available
  useEffect(() => {
    const fetchDriverData = async () => {
      console.log('EVDriverPage useEffect - authLoading:', authLoading, 'user:', user);
      
      // Don't fetch if auth is still loading
      if (authLoading) {
        console.log('Auth is still loading, skipping fetch');
        return;
      }
      
      if (user?.userId) {
        try {
          const apiClient = axios.create({
            baseURL: 'http://localhost/api/v1',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          console.log('Fetching driver data for user ID:', user.userId);
          const response = await apiClient.get<{
              id: number; userId: number
          }>(`/drivers/user/${user.userId}`);
          console.log('Driver response:', response.data);
          
          if (response.data?.id) {
            // Fetch cars for this driver using the new endpoint
            console.log('Fetching cars for driver ID:', response.data.id);
            await fetchCarsByDriver(response.data.id.toString());
          }
        } catch (error) {
          console.error('Error fetching driver data:', error);
        }
      } else {
        console.log('No user ID available');
      }
    };

    fetchDriverData();
  }, [authLoading, user, fetchCarsByDriver]);

  // Update slider progress CSS variable
  useEffect(() => {
    if (sliderRef.current) {
      const percentage = maxDistance === 0 ? 0 : (maxDistance / 500) * 100;
      const sliderContainer = sliderRef.current.parentElement;
      if (sliderContainer) {
        sliderContainer.style.setProperty('--slider-progress', `${percentage}%`);
      }
    }
  }, [maxDistance]);

  useEffect(() => {
    console.log("Auth loading:", authLoading);
    console.log("User ID:", user?.id);
    console.log("Cars:", cars);
    console.log("Cars loading:", carsLoading);
    console.log("Cars error:", carsError);
  }, [authLoading, user, cars, carsLoading, carsError]);


  const sortedStations = userLocation
    ? [...stations].sort(
        (a, b) =>
          getDistance(userLocation, [
            a.latitude ?? 0,
            a.longitude ?? 0,
          ]) -
          getDistance(userLocation, [
            b.latitude ?? 0,
            b.longitude ?? 0,
          ])
      )
    : stations;

  // Filtering logic
  const filteredStations = sortedStations.filter((station) => {
    // Filter by charger type
    const hasType =
      chargerTypeFilter === "all" ||
      (station.chargers ?? []).some(charger => charger.type === chargerTypeFilter);
    // Filter by availability
    const hasAvailability =
      availabilityFilter === "all" ||
      (station.chargers ?? []).some(charger => charger.status === availabilityFilter);
    // Filter by proximity
    const distance = userLocation && station.latitude && station.longitude
      ? getDistance(userLocation, [station.latitude, station.longitude])
      : 0;
    const withinDistance = maxDistance === 0 || distance <= maxDistance;
    return hasType && hasAvailability && withinDistance;
  });

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 15, {
        duration: 1,
        easeLinearity: 0.25
      });
      setSelectedStation(null);
    }
  };

  if (stationsLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center">
        <p>Loading stations...</p>
      </div>
    );
  }

  if (stationsError) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center">
        <p className="text-red-500">Error: {stationsError}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <style>{mapStyles}</style>
      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
          className="z-0"
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomright" />
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
          {showDistanceRadius && maxDistance > 0 && (
            <Circle
              center={userLocation}
              radius={maxDistance * 1000} // Convert km to meters
              pathOptions={{
                fillColor: "blue",
                fillOpacity: 0.1,
                color: "blue",
                weight: 2,
              }}
            />
          )}
          {filteredStations.map((station) => (
            station.latitude && station.longitude && (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                icon={stationIcon}
              >
                <Popup>
                  <StationPopup station={station} />
                </Popup>
              </Marker>
            )
          ))}
          {selectedStation?.latitude && selectedStation?.longitude && (
            <MapController 
              center={[selectedStation.latitude, selectedStation.longitude]} 
              zoom={15} 
            />
          )}
        </MapContainer>
      )}

      <div className="absolute top-4 right-4 z-[1001] flex gap-2 pointer-events-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white h-10"
                title="Manage cars"
              >
                <Car className="w-4 h-4" />
                <span>Manage Cars</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem 
                onClick={() => navigate("/evdriver/add-car")}
                className="cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>Add New Car</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {carsLoading ? (
                <DropdownMenuItem disabled>
                  <span className="text-sm text-gray-500">Loading cars...</span>
                </DropdownMenuItem>
              ) : carsError ? (
                <DropdownMenuItem disabled>
                  <span className="text-sm text-red-500">Error loading cars: {carsError}</span>
                </DropdownMenuItem>
              ) : cars.length === 0 ? (
                <DropdownMenuItem disabled>
                  <span className="text-sm text-gray-500">You have no cars yet</span>
                </DropdownMenuItem>
              ) : (
                <>
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
                    Your Cars
                  </div>
                  {cars.map((car) => (
                    <DropdownMenuItem 
                      key={car.id}
                      className="cursor-pointer"
                      onClick={() => {
                        // You can add navigation to car details or management page here
                        console.log('Selected car:', car);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{car.model}</span>
                        <span className="text-xs text-gray-500">{car.licensePlate}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={centerOnUser}
            variant="outline"
            className="bg-white/95 backdrop-blur-sm hover:bg-white h-10"
            title="Center on my location"
          >
            <MapPin className="w-4 h-4" />
            <span>My Location</span>
          </Button>

          <Button
            onClick={() => setIsBookingsDialogOpen(true)}
            variant="outline"
            className="bg-white/95 backdrop-blur-sm hover:bg-white h-10"
            title="View my bookings"
          >
            <Calendar className="w-4 h-4" />
            <span>My Bookings</span>
          </Button>

        {/* Filters Dropdown */}
        <div className="relative">
          <Button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            variant="outline"
            className="bg-white/95 backdrop-blur-sm hover:bg-white h-10"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                isFiltersOpen ? 'rotate-180' : ''
              }`} 
            />
          </Button>

          {isFiltersOpen && (
            <Card className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm border shadow-2xl z-[1002]">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label htmlFor="availability-filter" className="block text-sm font-semibold mb-2">Availability</label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger id="availability-filter" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="BEING_USED">In Use</SelectItem>
                      <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                      <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="charger-type-filter" className="block text-sm font-semibold mb-2">Charger Type</label>
                  <Select value={chargerTypeFilter} onValueChange={setChargerTypeFilter}>
                    <SelectTrigger id="charger-type-filter" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {allChargerTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Nearby Stations Dropdown */}
        <div className="relative">
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="outline"
            className="bg-white/95 backdrop-blur-sm hover:bg-white h-10"
          >
            <Navigation className="w-4 h-4" />
            <span>Nearby Stations</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </Button>

          {isDropdownOpen && (
            <Card className="absolute top-full right-0 mt-2 w-80 max-h-[32rem] overflow-y-auto bg-white/95 backdrop-blur-sm border shadow-2xl z-[1002]">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label htmlFor="max-distance-slider" className="block text-sm font-semibold mb-2">Max Distance (km)</label>
                  <div className="space-y-2">
                    <input
                      ref={sliderRef}
                      id="max-distance-slider"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={maxDistance}
                      onChange={e => setMaxDistance(Number(e.target.value))}
                      className="w-full"
                      style={{
                        background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(maxDistance/100)*100}%, rgb(226 232 240) ${(maxDistance/100)*100}%, rgb(226 232 240) 100%)`
                      }}
                    />
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>0 km</span>
                      <span className="font-medium text-gray-700">{maxDistance === 0 ? "No limit" : `${maxDistance} km`}</span>
                      <span>100 km</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-radius"
                    checked={showDistanceRadius}
                    onCheckedChange={setShowDistanceRadius}
                  />
                  <Label htmlFor="show-radius" className="text-sm font-medium cursor-pointer">
                    {showDistanceRadius ? (
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Show distance radius
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        Hide distance radius
                      </span>
                    )}
                  </Label>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {filteredStations.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No stations found.</div>
                    ) : (
                      filteredStations.map((station) => (
                        <button
                          key={station.id}
                          className="w-full text-left flex flex-col p-3 bg-white/80 rounded-lg border border-gray-200 hover:bg-white/90 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={() => {
                            setSelectedStation(station);
                            setIsDropdownOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedStation(station);
                              setIsDropdownOpen(false);
                            }
                          }}
                          aria-label={`Select ${station.name} station at ${station.address}`}
                        >
                          <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {station.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {station.address}
                          </div>
                          {userLocation && station.latitude && station.longitude && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {getDistance(userLocation, [
                                station.latitude,
                                station.longitude,
                              ]).toFixed(2)}{" "}
                              km away
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {(isDropdownOpen || isFiltersOpen) && (
        <button
          type="button"
          aria-label="Close dropdown"
          className="fixed inset-0 z-[1000] w-full h-full bg-transparent border-0 p-0 cursor-default focus:outline-none"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsFiltersOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsDropdownOpen(false);
            }
          }}
        />
      )}

      <Dialog open={isBookingsDialogOpen} onOpenChange={setIsBookingsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Bookings</DialogTitle>
            <DialogDescription>
              View and manage your charging session bookings
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <BookingsList />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EVDriverPage;