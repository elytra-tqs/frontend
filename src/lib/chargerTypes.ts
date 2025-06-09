export const CHARGER_TYPES = [
  { value: "Type 1", label: "Type 1 (J1772)" },
  { value: "Type 2", label: "Type 2 (Mennekes)" },
  { value: "CCS", label: "CCS" },
  { value: "CHAdeMO", label: "CHAdeMO" },
  { value: "Tesla", label: "Tesla" }
] as const;

export type ChargerType = typeof CHARGER_TYPES[number]["value"];