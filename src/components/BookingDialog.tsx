import { useState, useEffect } from "react";
import { format, addHours, isBefore, isAfter } from "date-fns";
import { Calendar, Clock, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings, type BookingRequest } from "@/contexts/BookingsContext";
import { useCars } from "@/contexts/CarsContext";
import { toast } from "sonner";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chargerId: number;
  chargerInfo: {
    type: string;
    power: number;
    stationName?: string;
  };
  existingBookings?: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export function BookingDialog({ 
  isOpen, 
  onClose, 
  chargerId, 
  chargerInfo,
  existingBookings = []
}: BookingDialogProps) {
  const { user } = useAuth();
  const { createBooking, loading } = useBookings();
  const { cars, fetchCarsByDriver } = useCars();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("1");
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [driverId, setDriverId] = useState<string | null>(null);
  
  // Fetch driver ID and cars when dialog opens
  useEffect(() => {
    const fetchDriverData = async () => {
      if (isOpen && user?.userId) {
        try {
          // First get driver ID from user ID
          const response = await fetch(`http://localhost/api/v1/drivers/user/${user.userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const driverData = await response.json();
            setDriverId(driverData.id.toString());
            // Then fetch cars for this driver
            await fetchCarsByDriver(driverData.id.toString());
          }
        } catch (error) {
          console.error("Error fetching driver data:", error);
        }
      }
    };
    
    fetchDriverData();
  }, [isOpen, user?.userId, fetchCarsByDriver]);
  
  // Filter cars that are compatible with the charger type
  const compatibleCars = cars.filter(car => car.chargerType === chargerInfo.type);
  
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const startHour = now.getHours() + 1;
    
    for (let i = 0; i < 24; i++) {
      const hour = (startHour + i) % 24;
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    
    return slots;
  };
  
  const isTimeSlotAvailable = (date: Date, startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date(date);
    start.setHours(hours, minutes, 0, 0);
    const end = addHours(start, duration);
    
    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return (
        (isAfter(start, bookingStart) && isBefore(start, bookingEnd)) ||
        (isAfter(end, bookingStart) && isBefore(end, bookingEnd)) ||
        (isBefore(start, bookingStart) && isAfter(end, bookingEnd)) ||
        start.getTime() === bookingStart.getTime() ||
        end.getTime() === bookingEnd.getTime()
      );
    });
  };
  
  const handleSubmit = async () => {
    if (!user || !selectedStartTime) {
      toast.error("Please select a start time");
      return;
    }
    
    if (!selectedCarId) {
      toast.error("Please select a car");
      return;
    }
    
    try {
      const [hours, minutes] = selectedStartTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = addHours(startTime, parseInt(selectedDuration));
      
      // Validate that booking is in the future
      if (isBefore(startTime, new Date())) {
        toast.error("Cannot book a time slot in the past");
        return;
      }
      
      // Validate that the selected time slot is available
      if (!isTimeSlotAvailable(selectedDate, selectedStartTime, parseInt(selectedDuration))) {
        toast.error("This time slot is not available");
        return;
      }
      
      // Validate booking duration
      if (parseInt(selectedDuration) < 1 || parseInt(selectedDuration) > 8) {
        toast.error("Booking duration must be between 1 and 8 hours");
        return;
      }
      
      const bookingData: BookingRequest = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        userId: user.userId,
        chargerId: chargerId,
        carId: parseInt(selectedCarId)
      };
      
      await createBooking(bookingData);
      
      toast.success("Booking created successfully!");
      onClose();
    } catch (error) {
      toast.error((error as Error).message || "Failed to create booking");
    }
  };
  
  const timeSlots = generateTimeSlots();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Charging Session</DialogTitle>
          <DialogDescription>
            Book a charging slot for {chargerInfo.type} ({chargerInfo.power} kW)
            {chargerInfo.stationName && ` at ${chargerInfo.stationName}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                id="date"
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="time">Start Time</Label>
            <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select start time">
                  {selectedStartTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {selectedStartTime}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => {
                  const isAvailable = isTimeSlotAvailable(
                    selectedDate, 
                    time, 
                    parseInt(selectedDuration)
                  );
                  
                  return (
                    <SelectItem 
                      key={time} 
                      value={time}
                      disabled={!isAvailable}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{time}</span>
                        {!isAvailable && (
                          <span className="text-xs text-muted-foreground ml-2">Unavailable</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="car">Select Car</Label>
            <Select value={selectedCarId} onValueChange={setSelectedCarId}>
              <SelectTrigger id="car">
                <SelectValue placeholder="Select a car">
                  {selectedCarId && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {cars.find(c => c.id === selectedCarId)?.model} - {cars.find(c => c.id === selectedCarId)?.licensePlate}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {compatibleCars.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No compatible cars found. You need a car with {chargerInfo.type} charger type.
                  </div>
                ) : (
                  compatibleCars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      <div className="flex flex-col">
                        <span>{car.model} - {car.licensePlate}</span>
                        <span className="text-xs text-muted-foreground">
                          Battery: {car.batteryCapacity} kWh | Type: {car.chargerType}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {cars.length > 0 && compatibleCars.length === 0 && (
              <p className="text-sm text-destructive">
                None of your cars are compatible with this {chargerInfo.type} charger.
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedStartTime && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">Booking Summary</p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedStartTime} - {
                  format(
                    addHours(
                      new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedStartTime}`),
                      parseInt(selectedDuration)
                    ),
                    'HH:mm'
                  )
                } ({selectedDuration} hour{parseInt(selectedDuration) > 1 ? 's' : ''})
              </p>
              {selectedCarId && (
                <p className="text-sm text-muted-foreground mt-1">
                  Car: {cars.find(c => c.id === selectedCarId)?.model} ({cars.find(c => c.id === selectedCarId)?.licensePlate})
                </p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedStartTime || !selectedCarId || loading || compatibleCars.length === 0}
          >
            {loading ? "Creating..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}