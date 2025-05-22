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
import { ChargerStatus } from "@/contexts/ChargersContext";

export interface Charger {
  id: number;
  name: string;
  type: string;
  power: number;
  status: string;
}

interface ChargersListProps {
  stationId: number;
  chargers: Charger[];
  onUpdateChargerStatus: (chargerId: number, newStatus: ChargerStatus) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
    case 'AVAILABLE':
      return 'text-green-500';
    case 'in-use':
    case 'BEING_USED':
      return 'text-blue-500';
    case 'maintenance':
    case 'UNDER_MAINTENANCE':
      return 'text-yellow-500';
    case 'out-of-service':
    case 'OUT_OF_SERVICE':
      return 'text-red-500';
    default:
      return '';
  }
};

const ChargersList: FC<ChargersListProps> = ({ stationId, chargers, onUpdateChargerStatus }) => {
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, ChargerStatus>>({});

  // Helper function to convert between UI status string and backend ChargerStatus enum
  const getStatusValue = (status: string): string => {
    // If it's already a proper enum value, return it
    if (Object.values(ChargerStatus).includes(status as ChargerStatus)) {
      return status;
    }
    
    // Otherwise, convert from UI string to enum
    switch (status.toLowerCase()) {
      case 'available':
        return ChargerStatus.AVAILABLE;
      case 'in-use':
        return ChargerStatus.BEING_USED;
      case 'maintenance':
        return ChargerStatus.UNDER_MAINTENANCE;
      case 'out-of-service':
        return ChargerStatus.OUT_OF_SERVICE;
      default:
        return ChargerStatus.AVAILABLE;
    }
  };

  // Get display name for status value
  const getStatusDisplayName = (status: string): string => {
    switch(status) {
      case ChargerStatus.AVAILABLE:
        return 'Available';
      case ChargerStatus.BEING_USED:
        return 'In Use';
      case ChargerStatus.UNDER_MAINTENANCE:
        return 'Under Maintenance';
      case ChargerStatus.OUT_OF_SERVICE:
        return 'Out of Service';
      default:
        return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const handleStatusChange = (chargerId: number, newStatus: string) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [chargerId]: getStatusValue(newStatus) as ChargerStatus
    }));
  };

  const handleUpdateStatus = (chargerId: number) => {
    const newStatus = selectedStatuses[chargerId];
    if (newStatus) {
      onUpdateChargerStatus(chargerId, newStatus);
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {chargers.map((charger) => (
        <AccordionItem key={charger.id} value={charger.id.toString()}>
          <AccordionTrigger className="px-4">
            <div className="flex justify-between w-full pr-4">
              <span>{charger.name}</span>
              <span className={`font-semibold ${getStatusColor(charger.status)}`}>
                {getStatusDisplayName(charger.status)}
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
                
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={selectedStatuses[charger.id] || charger.status}
                    onValueChange={(value) => handleStatusChange(charger.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {selectedStatuses[charger.id] 
                          ? getStatusDisplayName(selectedStatuses[charger.id]) 
                          : getStatusDisplayName(charger.status)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ChargerStatus.AVAILABLE}>Available</SelectItem>
                      <SelectItem value={ChargerStatus.BEING_USED}>In Use</SelectItem>
                      <SelectItem value={ChargerStatus.UNDER_MAINTENANCE}>Under Maintenance</SelectItem>
                      <SelectItem value={ChargerStatus.OUT_OF_SERVICE}>Out of Service</SelectItem>
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