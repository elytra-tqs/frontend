import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TimeSlot {
  time: string;
  isOccupied: boolean;
}

interface TimeSlotListProps {
  readonly slots: readonly TimeSlot[];
  readonly onBook: (time: string) => void;
}

export function TimeSlotList({ slots, onBook }: Readonly<TimeSlotListProps>) {
  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div key={slot.time} className="flex items-center justify-between p-2 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-medium">{slot.time}</span>
            <Label
              className={slot.isOccupied ? "text-red-500" : "text-green-500"}
            >
              {slot.isOccupied ? "Occupied" : "Free"}
            </Label>
          </div>
          <Button
            size="sm"
            disabled={slot.isOccupied}
            onClick={() => onBook(slot.time)}
          >
            Book
          </Button>
        </div>
      ))}
    </div>
  );
} 