import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { userIcon, stationIcon } from "@/lib/mapIcons";
import { getCurrentPosition, handleGeolocationError, getDistance } from "@/lib/geolocation";
import { MapLegend } from "@/components/MapLegend";
import { StationCard } from "@/components/StationCard";

export const stations = [
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



const NearbyStationsPage = ({
  stations,
}: {
  stations: Array<{
    id: string;
    name: string;
    location: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    getCurrentPosition({
      onSuccess: (position) => {
        console.log(position);
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      onError: (error) => {
        alert(handleGeolocationError(error));
      }
    });
  }, []);

  // Sort stations by proximity
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
    <div className="flex flex-col items-center p-4">
      <h1 className=" flex justify-center text-2xl font-bold mb-4">
        Nearby Charging Stations
      </h1>
      {userLocation && (
        <>
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
            attributionControl={false}
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
          </MapContainer>
          <MapLegend />
        </>
      )}
      <div className="w-full max-w-4xl mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedStations.map((station) => (
          <StationCard 
            key={station.id}
            station={station}
            userLocation={userLocation}
          />
        ))}
      </div>
    </div>
  );
};

export default NearbyStationsPage;
