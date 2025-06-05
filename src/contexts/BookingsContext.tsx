import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const api = axios.create({
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: "http://localhost/api/v1",
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}

// Helper function to convert array date format to ISO string
const convertArrayToISOString = (dateArray: number[] | string): string => {
  if (typeof dateArray === 'string') {
    return dateArray;
  }
  // Backend returns dates as [year, month, day, hour, minute]
  const [year, month, day, hour, minute] = dateArray;
  // Note: JavaScript months are 0-indexed, but the backend sends 1-indexed months
  const date = new Date(year, month - 1, day, hour, minute);
  return date.toISOString();
};

// Transform booking data from backend format
const transformBooking = (booking: any): Booking => {
  return {
    ...booking,
    startTime: convertArrayToISOString(booking.startTime),
    endTime: convertArrayToISOString(booking.endTime)
  };
};

export interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  user: {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  charger?: {
    id: number;
    type: string;
    power: number;
    status: string;
    stationId: number;
  };
  status: BookingStatus;
}

export interface BookingRequest {
  startTime: string;
  endTime: string;
  userId: number;
  chargerId: number;
}

interface BookingsContextProps {
  bookings: Booking[];
  userBookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchAllBookings: () => Promise<void>;
  fetchUserBookings: (userId: number) => Promise<void>;
  fetchBookingsByCharger: (chargerId: number) => Promise<Booking[]>;
  createBooking: (bookingData: BookingRequest) => Promise<Booking>;
  updateBookingStatus: (bookingId: number, status: BookingStatus) => Promise<Booking>;
  cancelBooking: (bookingId: number) => Promise<void>;
  deleteBooking: (bookingId: number) => Promise<void>;
}

const BookingsContext = createContext<BookingsContextProps | undefined>(undefined);

export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.userId) {
      fetchUserBookings(user.userId);
    }
  }, [user]);

  const fetchAllBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<any[]>("/bookings");
      const transformedBookings = response.data.map(transformBooking);
      setBookings(transformedBookings);
    } catch (err) {
      setError("Failed to fetch bookings");
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<any[]>(`/bookings/user/${userId}`);
      const transformedBookings = response.data.map(transformBooking);
      setUserBookings(transformedBookings);
    } catch (err) {
      setError("Failed to fetch user bookings");
      console.error("Error fetching user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByCharger = async (chargerId: number): Promise<Booking[]> => {
    try {
      const response = await api.get<any[]>(`/bookings/charger/${chargerId}`);
      const transformedBookings = response.data.map(transformBooking);
      return transformedBookings;
    } catch (err) {
      console.error("Error fetching charger bookings:", err);
      throw err;
    }
  };

  const createBooking = async (bookingData: BookingRequest): Promise<Booking> => {
    setLoading(true);
    setError(null);
    try {
      // Validate booking data
      if (!bookingData.startTime || !bookingData.endTime) {
        throw new Error("Start and end times are required");
      }
      
      const startDate = new Date(bookingData.startTime);
      const endDate = new Date(bookingData.endTime);
      
      if (startDate >= endDate) {
        throw new Error("End time must be after start time");
      }
      
      if (startDate < new Date()) {
        throw new Error("Cannot create bookings in the past");
      }
      
      const response = await api.post<any>("/bookings", bookingData);
      const newBooking = transformBooking(response.data);
      
      // Update local state
      setBookings(prev => [...prev, newBooking]);
      if (user?.userId === bookingData.userId) {
        setUserBookings(prev => [...prev, newBooking]);
      }
      
      return newBooking;
    } catch (err) {
      const error = err as any;
      const errorMessage = error.response?.data?.message || error.message || "Failed to create booking";
      setError(errorMessage);
      console.error("Error creating booking:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: BookingStatus): Promise<Booking> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put<any>(`/bookings/${bookingId}/status`, status, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const updatedBooking = transformBooking(response.data);
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
      setUserBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
      
      return updatedBooking;
    } catch (err) {
      const error = err as any;
      const errorMessage = error.response?.data?.message || "Failed to update booking status";
      setError(errorMessage);
      console.error("Error updating booking status:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number): Promise<void> => {
    await updateBookingStatus(bookingId, BookingStatus.CANCELLED);
  };

  const deleteBooking = async (bookingId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/bookings/${bookingId}`);
      
      // Update local state
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setUserBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      const error = err as any;
      const errorMessage = error.response?.data?.message || "Failed to delete booking";
      setError(errorMessage);
      console.error("Error deleting booking:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        userBookings,
        loading,
        error,
        fetchAllBookings,
        fetchUserBookings,
        fetchBookingsByCharger,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        deleteBooking,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingsProvider");
  }
  return context;
};