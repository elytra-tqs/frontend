import { type FC } from 'react';
import type { StationFormData } from '../../contexts/StationsContext';
import StationFormBase from './StationFormBase';

interface EditStationFormProps {
  stationId: number;
  initialData: StationFormData;
  onSubmit: (stationId: number, stationData: StationFormData) => void;
  onCancel: () => void;
}

const EditStationForm: FC<EditStationFormProps> = ({ stationId, initialData, onSubmit, onCancel }) => {
  const handleSubmit = (formData: StationFormData) => {
    onSubmit(stationId, formData);
  };

  return (
    <StationFormBase
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitButtonText="Update Station"
    />
  );
};

export default EditStationForm; 