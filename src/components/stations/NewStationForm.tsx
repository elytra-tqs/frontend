import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type ChangeEvent, type FC, type FormEvent, useEffect } from 'react';
import type { StationFormData } from '../../contexts/StationsContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

interface NewStationFormProps {
  onSubmit: (stationData: StationFormData) => void;
  onCancel: () => void;
}

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks and recentering
const MapController = ({ 
  onMapClick, 
  center 
}: { 
  onMapClick: (lat: number, lng: number) => void;
  center: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const NewStationForm: FC<NewStationFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    location: '',
    coordinates: {
      latitude: 40.6405, // Default to Aveiro coordinates
      longitude: -8.6538,
    },
    chargerTypes: [],
  });

  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    formData.coordinates.latitude,
    formData.coordinates.longitude,
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      const newValue = parent === 'coordinates' ? parseFloat(value) || 0 : value;
      
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StationFormData] as Record<string, any>),
          [child]: newValue,
        },
      }));

      if (parent === 'coordinates') {
        const newCoordinates = {
          ...formData.coordinates,
          [child]: newValue,
        };
        setMarkerPosition([newCoordinates.latitude, newCoordinates.longitude]);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    setFormData(prev => ({
      ...prev,
      coordinates: {
        latitude: lat,
        longitude: lng,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Station Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Select Location on Map</Label>
        <div className="h-[300px] w-full rounded-md border">
          <MapContainer
            center={markerPosition}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={markerPosition} icon={icon} />
            <MapController onMapClick={handleMapClick} center={markerPosition} />
          </MapContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="coordinates.latitude">Latitude</Label>
          <Input
            type="number"
            id="coordinates.latitude"
            name="coordinates.latitude"
            value={formData.coordinates.latitude}
            onChange={handleInputChange}
            required
            step="any"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coordinates.longitude">Longitude</Label>
          <Input
            type="number"
            id="coordinates.longitude"
            name="coordinates.longitude"
            value={formData.coordinates.longitude}
            onChange={handleInputChange}
            required
            step="any"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Register Station
        </Button>
      </div>
    </form>
  );
};

export default NewStationForm; 