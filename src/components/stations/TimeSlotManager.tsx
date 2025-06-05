import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Charger } from "../../contexts/ChargersContext";

export interface TimeSlot {
  id: string;
  chargerId: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TimeSlotManagerProps {
  readonly chargers: readonly Charger[];
  readonly timeSlots: readonly TimeSlot[];
  readonly onAddSlot?: (slot: Omit<TimeSlot, "id">) => void;
  readonly onRemoveSlot: (slotId: string) => void;
  readonly onToggleAvailability: (slotId: string) => void;
}

export function TimeSlotManager({ chargers, timeSlots, onRemoveSlot, onToggleAvailability }: Readonly<TimeSlotManagerProps>) {
  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        {chargers.map((charger) => {
          const chargerSlots = timeSlots.filter(slot => slot.chargerId === charger.id);
          return (
            <AccordionItem key={charger.id} value={charger.id.toString()}>
              <AccordionTrigger className="px-4">
                <div className="flex justify-between w-full pr-4">
                  <span className="font-semibold">Charger {charger.id} - {charger.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {chargerSlots.length} time slots
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {chargerSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{slot.startTime}</span>
                              <span>-</span>
                              <span className="font-medium">{slot.endTime}</span>
                            </div>
                            <Label
                              className={slot.isAvailable ? "text-green-500" : "text-red-500"}
                            >
                              {slot.isAvailable ? "Available" : "Unavailable"}
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onToggleAvailability(slot.id)}
                            >
                              {slot.isAvailable ? "Set Unavailable" : "Set Available"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onRemoveSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {chargerSlots.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No time slots defined for this charger.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
} 