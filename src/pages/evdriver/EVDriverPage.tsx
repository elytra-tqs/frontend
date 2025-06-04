import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { ChevronDown, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStations } from "../../contexts/StationsContext";
import { ChargerStatus } from "../../contexts/ChargersContext";
import { StationPopup } from "@/components/StationPopup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  iconSize: [25, 41],
});

const stationIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  iconSize: [25, 41],
});

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
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { stations: rawStations, loading: stationsLoading, error: stationsError } = useStations();
  const stations = rawStations as Station[];
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 means no limit
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [chargerTypeFilter, setChargerTypeFilter] = useState<string>("all");
  const allChargerTypes = ["Type1", "Type2", "Type3"]; // Replace with actual charger types

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }, []);

  function successCallback(position: GeolocationPosition) {
    setUserLocation([position.coords.latitude, position.coords.longitude]);
  }

  function errorCallback(error: GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.");
        break;
      default:
        alert("An unknown error occurred.");
        break;
    }
  }

  function getDistance(
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number]
  ) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

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
        <Button
          onClick={centerOnUser}
          variant="outline"
          className="bg-white/95 backdrop-blur-sm hover:bg-white h-10"
          title="Center on my location"
        >
          <MapPin className="w-4 h-4" />
          <span>My Location</span>
        </Button>

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
              <CardContent className="p-3 -mt-5 -mb-5">
                <div className="space-y-2 mb-4">
                  <div>
                    <label htmlFor="availability-filter" className="block text-xs font-semibold mb-1">Availability</label>
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger id="availability-filter" className="w-full" aria-labelledby="availability-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="BEING_USED">In Use</SelectItem>
                        <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                        <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="charger-type-filter" className="block text-xs font-semibold mb-1">Charger Type</label>
                    <Select value={chargerTypeFilter} onValueChange={setChargerTypeFilter}>
                      <SelectTrigger id="charger-type-filter" className="w-full" aria-labelledby="charger-type-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {allChargerTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="max-distance-input" className="block text-xs font-semibold mb-1">Max Distance (km)</label>
                    <input
                      id="max-distance-input"
                      type="number"
                      min={0}
                      value={maxDistance}
                      onChange={e => setMaxDistance(Number(e.target.value))}
                      className="w-full border rounded px-2 py-1 text-sm"
                      placeholder="0 = unlimited"
                      aria-describedby="max-distance-help"
                    />
                    <div id="max-distance-help" className="sr-only">
                      Enter maximum distance in kilometers. Leave as 0 for unlimited range.
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredStations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No results found.</div>
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {isDropdownOpen && (
        <button
          type="button"
          aria-label="Close stations list"
          className="fixed inset-0 z-[1000] w-full h-full bg-transparent border-0 p-0 cursor-default focus:outline-none"
          onClick={() => setIsDropdownOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsDropdownOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}

export default EVDriverPage;