import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { ChevronDown, MapPin, Navigation, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const mapStyles = `
  .leaflet-top.leaflet-left .leaflet-control-zoom {
    display: none !important;
  }
`;

interface Charger {
  id: number;
  name: string;
  type: string;
  power: number;
  status: string;
}

interface Station {
  id: string;
  name: string;
  location: string;
  coordinates: { latitude: number; longitude: number };
  chargers: Charger[];
}

const stations: Station[] = [
  {
    id: "1",
    name: "Aveiro City Center Station",
    location: "Aveiro City Center, Portugal",
    coordinates: { latitude: 40.6405, longitude: -8.6538 },
    chargers: [
      { id: 1, name: "Charger 1", type: "Type 2", power: 22, status: "AVAILABLE" },
      { id: 2, name: "Charger 2", type: "CCS", power: 50, status: "BEING_USED" },
      { id: 3, name: "Charger 3", type: "Type 2", power: 22, status: "AVAILABLE" },
    ],
  },
  {
    id: "2",
    name: "Universidade de Aveiro",
    location: "Universidade de Aveiro, Portugal",
    coordinates: { latitude: 40.6302, longitude: -8.6576 },
    chargers: [
      { id: 4, name: "Charger 1", type: "CCS", power: 50, status: "AVAILABLE" },
      { id: 5, name: "Charger 2", type: "Type 2", power: 22, status: "UNDER_MAINTENANCE" },
    ],
  },
  {
    id: "3",
    name: "Forum Aveiro Station",
    location: "Forum Aveiro, Portugal",
    coordinates: { latitude: 40.6412, longitude: -8.6531 },
    chargers: [
      { id: 6, name: "Charger 1", type: "Type 2", power: 22, status: "AVAILABLE" },
      { id: 7, name: "Charger 2", type: "CCS", power: 50, status: "AVAILABLE" },
      { id: 8, name: "Charger 3", type: "Type 2", power: 22, status: "OUT_OF_SERVICE" },
    ],
  },
];

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

function StationPopup({ station }: { station: Station }) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500";
      case "BEING_USED":
        return "bg-blue-500";
      case "UNDER_MAINTENANCE":
        return "bg-yellow-500";
      case "OUT_OF_SERVICE":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "AVAILABLE":
        return "Available";
      case "BEING_USED":
        return "In Use";
      case "UNDER_MAINTENANCE":
        return "Maintenance";
      case "OUT_OF_SERVICE":
        return "Out of Service";
      default:
        return status;
    }
  };

  return (
    <div className="w-64">
      <h3 className="font-semibold text-lg -mb-3">{station.name}</h3>
      <p className="text-xs text-gray-600 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {station.location}
      </p>
      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-2">
          {station.chargers.map((charger) => (
            <Card key={charger.id} className="p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{charger.name}</h4>
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
                disabled={charger.status !== "AVAILABLE"}
                onClick={() => {
                  // implement booking functionality
                  console.log("Book charger:", charger.id);
                }}
              >
                {charger.status === "AVAILABLE" ? "Book Now" : "Unavailable"}
              </Button>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function EVDriverPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<typeof stations[0] | null>(null);
  const mapRef = useRef<L.Map | null>(null);

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
            a.coordinates.latitude,
            a.coordinates.longitude,
          ]) -
          getDistance(userLocation, [
            b.coordinates.latitude,
            b.coordinates.longitude,
          ])
      )
    : stations;

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 15, {
        duration: 1,
        easeLinearity: 0.25
      });
      setSelectedStation(null);
    }
  };

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
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={[
                station.coordinates.latitude,
                station.coordinates.longitude,
              ]}
              icon={stationIcon}
            >
              <Popup>
                <StationPopup station={station} />
              </Popup>
            </Marker>
          ))}
          {selectedStation && (
            <MapController 
              center={[selectedStation.coordinates.latitude, selectedStation.coordinates.longitude]} 
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
            <Card className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm border shadow-2xl z-[1002]">
              <CardContent className="p-3 -mt-5 -mb-5">
                <div className="space-y-2">
                  {sortedStations.map((station) => (
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
                    >
                      <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                        {station.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {station.location}
                      </div>
                      {userLocation && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {getDistance(userLocation, [
                            station.coordinates.latitude,
                            station.coordinates.longitude,
                          ]).toFixed(2)}{" "}
                          km away
                        </div>
                      )}
                    </button>
                  ))}
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