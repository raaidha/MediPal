// hooks/useMedications.ts
import { useMedicationsContext } from '../context/MedicationsContext';

export const useMedications = () => {
  return useMedicationsContext();
};
