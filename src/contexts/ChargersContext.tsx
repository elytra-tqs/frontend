import {createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export enum ChargerStatus {
    AVAILABLE = 'AVAILABLE',
    BEING_USED = 'BEING_USED',
    UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface Charger {
    id: number;
    type: string;
    power: number;
    status: ChargerStatus;
    stationId: number;
}

interface ChargersContextType {
    chargers: Charger[];
    getChargerAvailability: (chargerId: number) => Promise<ChargerStatus>;
    updateChargerAvailability: (chargerId: number, status: ChargerStatus) => Promise<void>;
    fetchChargersByAvailability: (status: ChargerStatus) => Promise<void>;
}

const ChargersContext = createContext<ChargersContextType | undefined>(undefined);

export const ChargersProvider = ({ children }: { children: ReactNode }) => {
    const [chargers, setChargers] = useState<Charger[]>([]);

    const getChargerAvailability = async (chargerId: number): Promise<ChargerStatus> => {
        const response = await axios.get<ChargerStatus>(`/api/v1/chargers/${chargerId}/availability`);
        return response.data;
    };

    const updateChargerAvailability = async (chargerId: number, status: ChargerStatus): Promise<void> => {
        await axios.put(`/api/v1/chargers/${chargerId}/availability`, JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' }
        });
        // Optionally refresh charger list
    };

    const fetchChargersByAvailability = async (status: ChargerStatus): Promise<void> => {
        const response = await axios.get<Charger[]>(`/api/v1/chargers/availability/${status}`);
        setChargers(response.data);
    };

    return (
        <ChargersContext.Provider
            value={{
                chargers,
                getChargerAvailability,
                updateChargerAvailability,
                fetchChargersByAvailability
            }}
        >
            {children}
        </ChargersContext.Provider>
    );
};

export const useChargers = (): ChargersContextType => {
    const context = useContext(ChargersContext);
    if (!context) {
        throw new Error('useChargers must be used within a ChargersProvider');
    }
    return context;
};