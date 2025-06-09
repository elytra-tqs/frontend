import { useState, type FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChargerStatus } from "@/contexts/ChargersContext";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Charger {
  id: number;
  name: string;
  type: string;
  power: number;
  status: string;
}

interface ChargersListProps {
  chargers: Charger[];
  onUpdateChargerStatus: (chargerId: number, newStatus: ChargerStatus) => void;
  onUpdateCharger: (chargerId: number, chargerData: { type: string; power: number }) => void;
  onDeleteCharger: (chargerId: number) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "available":
    case "AVAILABLE":
      return "text-green-500";
    case "in-use":
    case "BEING_USED":
      return "text-blue-500";
    case "maintenance":
    case "UNDER_MAINTENANCE":
      return "text-yellow-500";
    case "out-of-service":
    case "OUT_OF_SERVICE":
      return "text-red-500";
    default:
      return "";
  }
};

const ChargersList: FC<ChargersListProps> = ({
  chargers,
  onUpdateChargerStatus,
  onUpdateCharger,
  onDeleteCharger,
}) => {
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<number, ChargerStatus>
  >({});
  const [editingCharger, setEditingCharger] = useState<Charger | null>(null);
  const [deletingCharger, setDeletingCharger] = useState<Charger | null>(null);
  const [editFormData, setEditFormData] = useState<{ type: string; power: number }>({
    type: "",
    power: 0,
  });

  // Helper function to convert between UI status string and backend ChargerStatus enum
  const getStatusValue = (status: string): string => {
    // If it's already a proper enum value, return it
    if (Object.values(ChargerStatus).includes(status as ChargerStatus)) {
      return status;
    }

    // Otherwise, convert from UI string to enum
    switch (status.toLowerCase()) {
      case "available":
        return ChargerStatus.AVAILABLE;
      case "in-use":
        return ChargerStatus.BEING_USED;
      case "maintenance":
        return ChargerStatus.UNDER_MAINTENANCE;
      case "out-of-service":
        return ChargerStatus.OUT_OF_SERVICE;
      default:
        return ChargerStatus.AVAILABLE;
    }
  };

  // Get display name for status value
  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case ChargerStatus.AVAILABLE:
        return "Available";
      case ChargerStatus.BEING_USED:
        return "In Use";
      case ChargerStatus.UNDER_MAINTENANCE:
        return "Under Maintenance";
      case ChargerStatus.OUT_OF_SERVICE:
        return "Out of Service";
      default:
        return status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  const handleStatusChange = (chargerId: number, newStatus: string) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [chargerId]: getStatusValue(newStatus) as ChargerStatus,
    }));
  };

  const handleUpdateStatus = (chargerId: number) => {
    const newStatus = selectedStatuses[chargerId];
    if (newStatus) {
      onUpdateChargerStatus(chargerId, newStatus);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCharger) {
      onUpdateCharger(editingCharger.id, editFormData);
      setEditingCharger(null);
    }
  };

  const handleEditClick = (charger: Charger) => {
    setEditingCharger(charger);
    setEditFormData({
      type: charger.type,
      power: charger.power,
    });
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        {chargers.map((charger) => (
          <AccordionItem key={charger.id} value={charger.id.toString()}>
            <AccordionTrigger className="px-4">
              <div className="flex justify-between w-full pr-4">
                <span>{charger.name}</span>
                <span
                  className={`font-semibold ${getStatusColor(charger.status)}`}
                >
                  {getStatusDisplayName(charger.status)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Charger Type
                      </p>
                      <p>{charger.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Power Output
                      </p>
                      <p>{charger.power} kW</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={selectedStatuses[charger.id] || charger.status}
                      onValueChange={(value) =>
                        handleStatusChange(charger.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {selectedStatuses[charger.id]
                            ? getStatusDisplayName(selectedStatuses[charger.id])
                            : getStatusDisplayName(charger.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ChargerStatus.AVAILABLE}>
                          Available
                        </SelectItem>
                        <SelectItem value={ChargerStatus.BEING_USED}>
                          In Use
                        </SelectItem>
                        <SelectItem value={ChargerStatus.UNDER_MAINTENANCE}>
                          Under Maintenance
                        </SelectItem>
                        <SelectItem value={ChargerStatus.OUT_OF_SERVICE}>
                          Out of Service
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => handleUpdateStatus(charger.id)}>
                      Update Status
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(charger)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCharger(charger)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={!!editingCharger} onOpenChange={() => setEditingCharger(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Charger</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Charger Type</Label>
              <Input
                id="type"
                value={editFormData.type}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="power">Power Output (kW)</Label>
              <Input
                id="power"
                type="number"
                value={editFormData.power}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    power: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingCharger(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCharger} onOpenChange={() => setDeletingCharger(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Charger</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this charger? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCharger(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingCharger) {
                  onDeleteCharger(deletingCharger.id);
                  setDeletingCharger(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChargersList;
