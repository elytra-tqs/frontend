import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export const stations = [
    {
      id: '1',
      name: 'Aveiro City Center Station',
      location: 'Aveiro City Center, Portugal',
      coordinates: { latitude: 40.6405, longitude: -8.6538 },
    },
    {
      id: '2',
      name: 'Universidade de Aveiro',
      location: 'Universidade de Aveiro, Portugal',
      coordinates: { latitude: 40.6302, longitude: -8.6576 },
    },
    {
      id: '3',
      name: 'Forum Aveiro Station',
      location: 'Forum Aveiro, Portugal',
      coordinates: { latitude: 40.6412, longitude: -8.6531 },
    },
  ];

const MapLegend = () => (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        background: "white",
        padding: "8px 16px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      <div className="flex items-center mb-1">
        <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" alt="User" style={{ width: 20, marginRight: 8 }} />
        <span>Your Location</span>
      </div>
      <div className="flex items-center">
        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" alt="Station" style={{ width: 20, marginRight: 8 }} />
        <span>Charging Station</span>
      </div>
    </div>
  ); 

const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  iconSize: [25, 41],
});

const stationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  iconSize: [25, 41],
});

const NearbyStationsPage = ({ stations }: { stations: Array<{
  id: string;
  name: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}> }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback
    );
  }, []);

  function successCallback(position: GeolocationPosition) {
    // Success
    console.log(position);
    setUserLocation([position.coords.latitude, position.coords.longitude]);
  }

  function errorCallback(error: GeolocationPositionError) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.");
        break;
    }
  }

  // Calculate distance between two lat/lng points (Haversine formula)
  function getDistance([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Sort stations by proximity
  const sortedStations = userLocation
    ? [...stations].sort(
        (a, b) =>
          getDistance(userLocation, [a.coordinates.latitude, a.coordinates.longitude]) -
          getDistance(userLocation, [b.coordinates.latitude, b.coordinates.longitude])
      )
    : stations;

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className=" flex justify-center text-2xl font-bold mb-4">Nearby Charging Stations</h1>
      {userLocation && (
        <>
          <MapContainer 
                center={userLocation} zoom={13} 
                style={{ height: "400px", width: "100%" }} 
                attributionControl={false}
            >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={userLocation} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            {stations.map((station) => (
              <Marker
                key={station.id}
                position={[station.coordinates.latitude, station.coordinates.longitude]}
                icon={stationIcon}
              >
                <Popup>
                  <b>{station.name}</b>
                  <br />
                  {station.location}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <MapLegend />
        </>
      )}
      <div className="w-full max-w-4xl mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedStations.map((station) => (
          <div
            key={station.id}
            className="flex flex-col justify-between bg-white rounded-lg shadow p-4 border h-full"
          >
            <div>
              <div className="text-lg font-semibold">{station.name}</div>
              <div className="text-gray-500">{station.location}</div>
              {userLocation && (
                <div className="text-sm text-gray-400">
                  {getDistance(userLocation, [station.coordinates.latitude, station.coordinates.longitude]).toFixed(2)} km away
                </div>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => window.location.href = `/stations/${station.id}`}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyStationsPage;
