import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, type ChangeEvent, type FC, type FormEvent } from 'react';
import { ChargerStatus } from "@/contexts/ChargersContext";

export interface ChargerFormData {
  type: string;
  power: number;
  status: ChargerStatus;
}

interface NewChargerFormProps {
  stationId: number;
  onSubmit: (stationId: number, chargerData: ChargerFormData) => Promise<void>;
  onCancel: () => void;
}

const NewChargerForm: FC<NewChargerFormProps> = ({ stationId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ChargerFormData>({
    type: 'Type2',
    power: 22,
    status: ChargerStatus.AVAILABLE
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(stationId, formData);
    window.location.reload();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'power') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as ChargerStatus
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Charger Type</Label>
        <Input
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="power">Power (kW)</Label>
        <Input
          type="number"
          id="power"
          name="power"
          value={formData.power}
          onChange={handleInputChange}
          required
          min="1"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ChargerStatus.AVAILABLE}>Available</SelectItem>
            <SelectItem value={ChargerStatus.BEING_USED}>In Use</SelectItem>
            <SelectItem value={ChargerStatus.UNDER_MAINTENANCE}>Under Maintenance</SelectItem>
            <SelectItem value={ChargerStatus.OUT_OF_SERVICE}>Out of Service</SelectItem>
          </SelectContent>
        </Select>
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
          Add Charger
        </Button>
      </div>
    </form>
  );
};

export default NewChargerForm; 