import { type FC } from 'react';
import type { StationFormData } from '../../contexts/StationsContext';
import StationFormBase from './StationFormBase';

interface NewStationFormProps {
  onSubmit: (stationData: StationFormData) => void;
  onCancel: () => void;
}

const NewStationForm: FC<NewStationFormProps> = ({ onSubmit, onCancel }) => {
  const initialData: StationFormData = {
    name: '',
    location: '',
    coordinates: {
      latitude: 40.6405, // Aveiro
      longitude: -8.6538, // Aveiro
    },
  };

  return (
    <StationFormBase
      initialData={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitButtonText="Create Station"
    />
  );
};

export default NewStationForm; 