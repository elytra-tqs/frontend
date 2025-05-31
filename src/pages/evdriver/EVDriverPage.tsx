import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { ChevronDown, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stations = [
  {
    id: "1",
    name: "Aveiro City Center Station",
    location: "Aveiro City Center, Portugal",
    coordinates: { latitude: 40.6405, longitude: -8.6538 },
  },
  {
    id: "2",
    name: "Universidade de Aveiro",
    location: "Universidade de Aveiro, Portugal",
    coordinates: { latitude: 40.6302, longitude: -8.6576 },
  },
  {
    id: "3",
    name: "Forum Aveiro Station",
    location: "Forum Aveiro, Portugal",
    coordinates: { latitude: 40.6412, longitude: -8.6531 },
  },
];

const MapLegend = () => (
  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border text-sm z-[1000]">
    <div className="flex items-center mb-2">
      <img
        src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
        alt="User"
        className="w-5 h-5 mr-2"
      />
      <span className="font-medium">Your Location</span>
    </div>
    <div className="flex items-center">
      <img
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
        alt="Station"
        className="w-5 h-5 mr-2"
      />
      <span className="font-medium">Charging Station</span>
    </div>
  </div>
);

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

  return (
    <div className="relative w-full h-full overflow-hidden">
      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
          className="z-0"
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                <b>{station.name}</b>
                <br />
                {station.location}
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

      <MapLegend />

      <div className="absolute top-4 right-4 z-[1000]">
        <div className="relative">
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="outline"
            className="bg-white/95 backdrop-blur-sm hover:bg-white"
          >
            <Navigation className="w-4 h-4" />
            Nearby Stations
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </Button>

          {isDropdownOpen && (
            <Card className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm border shadow-2xl z-[1001]">
              <CardContent className="p-3 -mt-5 -mb-5">
                <div className="space-y-2">
                  {sortedStations.map((station) => (
                    <div
                      key={station.id}
                      className="flex flex-col p-3 bg-white/80 rounded-lg border border-gray-200 hover:bg-white/90 transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedStation(station);
                        setIsDropdownOpen(false);
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default EVDriverPage;