import { useEffect } from "react";
import { format, isPast, isFuture } from "date-fns";
import { Calendar, Clock, MapPin, Zap, MoreHorizontal, X, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings, BookingStatus, type Booking } from "@/contexts/BookingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BookingsListProps {
  showAllBookings?: boolean;
  chargerId?: number;
  compact?: boolean;
}

export function BookingsList({ 
  showAllBookings = false, 
  chargerId, 
  compact = false 
}: BookingsListProps) {
  const { user } = useAuth();
  const { 
    userBookings, 
    bookings, 
    loading, 
    error, 
    fetchAllBookings, 
    fetchUserBookings,
    fetchBookingsByCharger,
    cancelBooking,
    updateBookingStatus 
  } = useBookings();
  
  useEffect(() => {
    if (chargerId) {
      fetchBookingsByCharger(chargerId);
    } else if (showAllBookings) {
      fetchAllBookings();
    } else if (user?.userId) {
      fetchUserBookings(user.userId);
    }
  }, [showAllBookings, chargerId, user?.userId]);
  
  const handleCancelBooking = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
    } catch (error) {
      const err = error as any;
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to cancel booking";
      toast.error(errorMessage);
    }
  };
  
  const handleCompleteBooking = async (bookingId: number) => {
    try {
      await updateBookingStatus(bookingId, BookingStatus.COMPLETED);
      toast.success("Booking marked as completed");
    } catch (error) {
      const err = error as any;
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to complete booking";
      toast.error(errorMessage);
    }
  };
  
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case BookingStatus.CONFIRMED:
        return "bg-blue-100 text-blue-800";
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      case BookingStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const isBookingActive = (booking: Booking) => {
    const now = new Date();
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    return now >= start && now <= end && booking.status === BookingStatus.CONFIRMED;
  };
  
  const canCancelBooking = (booking: Booking) => {
    return (
      booking.status === BookingStatus.PENDING || 
      booking.status === BookingStatus.CONFIRMED
    ) && isFuture(new Date(booking.startTime));
  };
  
  const displayBookings = showAllBookings ? bookings : userBookings;
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (displayBookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No bookings found</p>
        </CardContent>
      </Card>
    );
  }
  
  if (compact) {
    return (
      <div className="space-y-2">
        {displayBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(booking.startTime), 'MMM d, HH:mm')} - 
                  {format(new Date(booking.endTime), 'HH:mm')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {booking.user.firstName} {booking.user.lastName}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {displayBookings.map((booking) => (
        <Card key={booking.id} className={isBookingActive(booking) ? "border-primary" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  Booking #{booking.id}
                  {isBookingActive(booking) && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      Active Now
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {showAllBookings && (
                    <span>
                      {booking.user.firstName} {booking.user.lastName} • 
                    </span>
                  )}
                  {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canCancelBooking(booking) && (
                    <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </DropdownMenuItem>
                  )}
                  {isPast(new Date(booking.endTime)) && 
                   booking.status === BookingStatus.CONFIRMED && (
                    <DropdownMenuItem onClick={() => handleCompleteBooking(booking.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(booking.startTime), 'HH:mm')} - 
                  {format(new Date(booking.endTime), 'HH:mm')}
                </span>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              
              {booking.charger && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Charger {booking.charger.id} • {booking.charger.type} • {booking.charger.power} kW
                    </span>
                  </div>
                  
                  {booking.charger.stationId && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Station #{booking.charger.stationId}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}