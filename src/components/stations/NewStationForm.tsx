import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type ChangeEvent, type FC, type FormEvent } from 'react';

interface NewStationFormProps {
  onSubmit: (stationData: StationFormData) => void;
  onCancel: () => void;
}

interface StationFormData {
  name: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  numberOfChargers: number;
  chargerTypes: string[];
}

const NewStationForm: FC<NewStationFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    location: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    numberOfChargers: 1,
    chargerTypes: [],
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StationFormData] as Record<string, any>),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
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

      <div className="space-y-2">
        <Label htmlFor="numberOfChargers">Number of Chargers</Label>
        <Input
          type="number"
          id="numberOfChargers"
          name="numberOfChargers"
          value={formData.numberOfChargers}
          onChange={handleInputChange}
          required
          min="1"
        />
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