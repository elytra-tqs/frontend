import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface Station {
    id?: number;
    name: string;
    address: string;
}

interface StationsContextProps {
    stations: Station[];
    fetchStations: () => void;
    registerStation: (station: Station) => Promise<void>;
}

const StationsContext = createContext<StationsContextProps | undefined>(undefined);

export const StationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stations, setStations] = useState<Station[]>([]);

    const fetchStations = async () => {
        try {
            const response = await axios.get('/stations');
            setStations(response.data);
        } catch (error) {
            console.error('Failed to fetch stations', error);
        }
    };

    const registerStation = async (station: Station) => {
        try {
            const response = await axios.post('/stations', station);
            setStations((prev) => [...prev, response.data]);
        } catch (error) {
            console.error('Failed to register station', error);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    return (
        <StationsContext.Provider value={{ stations, fetchStations, registerStation }}>
            {children}
        </StationsContext.Provider>
    );
};

export const useStations = (): StationsContextProps => {
    const context = useContext(StationsContext);
    if (!context) {
        throw new Error('useStations must be used within a StationsProvider');
    }
    return context;
};