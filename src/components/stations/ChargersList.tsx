import { useState, type FC } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export type ChargerStatus = 'available' | 'in-use' | 'maintenance' | 'out-of-service';

export interface Charger {
  id: string;
  name: string;
  type: string;
  power: number;
  status: ChargerStatus;
}

interface ChargersListProps {
  stationId: string;
  chargers: Charger[];
  onUpdateChargerStatus: (chargerId: string, newStatus: ChargerStatus) => void;
}

const getStatusColor = (status: ChargerStatus): string => {
  switch (status) {
    case 'available':
      return 'text-green-500';
    case 'in-use':
      return 'text-blue-500';
    case 'maintenance':
      return 'text-yellow-500';
    case 'out-of-service':
      return 'text-red-500';
    default:
      return '';
  }
};

const ChargersList: FC<ChargersListProps> = ({ stationId, chargers, onUpdateChargerStatus }) => {
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, ChargerStatus>>({});

  const handleStatusChange = (chargerId: string, newStatus: ChargerStatus) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [chargerId]: newStatus
    }));
  };

  const handleUpdateStatus = (chargerId: string) => {
    const newStatus = selectedStatuses[chargerId];
    if (newStatus) {
      onUpdateChargerStatus(chargerId, newStatus);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {chargers.map((charger) => (
        <AccordionItem key={charger.id} value={charger.id}>
          <AccordionTrigger className="px-4">
            <div className="flex justify-between w-full pr-4">
              <span>{charger.name}</span>
              <span className={`font-semibold ${getStatusColor(charger.status)}`}>
                {charger.status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Charger Type</p>
                    <p>{charger.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Power Output</p>
                    <p>{charger.power} kW</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 items-end">
                  <Select
                    value={selectedStatuses[charger.id] || charger.status}
                    onValueChange={(value) => handleStatusChange(charger.id, value as ChargerStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-use">In Use</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="out-of-service">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleUpdateStatus(charger.id)}>
                    Update Status
                  </Button>
                </div>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ChargersList; 