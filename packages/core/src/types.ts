/** Bumped whenever a stored or exported layout stops being readable by the old parser. */
export const SCHEMA_VERSION = 1;

export type Face = "front" | "rear";
export type RackWidth = 19 | 10;
export type LinkKind = "network" | "power";

export type DeviceType =
  | "equipment"
  | "server"
  | "switch"
  | "patch"
  | "pdu"
  | "ups"
  | "shelf"
  | "blank"
  | "hooks"
  | "brush";

export type CableType = "cat5e" | "cat6" | "cat6a" | "fibre" | "dac" | "power";

export interface Rack {
  id: string;
  name: string;
  width: RackWidth;
  /** Height in rack units, 1..MAX_RACK_UNITS. */
  units: number;
  depthMm: number;
}

export interface Device {
  id: string;
  rackId: string;
  face: Face;
  /** Distance in units from the bottom of the rack; always a multiple of 0.5. */
  posU: number;
  heightU: number;
  type: DeviceType;
  name: string;
  colour: string;
  /** Network ports drawn on the device face. */
  ports: number;
  /** Power outlets this device supplies to others (PDUs and UPSes). */
  outlets: number;
  watts: number;
  weightKg: number;
  depthMm: number;
  notes: string;
}

export interface LinkEnd {
  deviceId: string;
  /** Network port index, or — for power links — an outlet index on the supplier and 0 on the drawing device. */
  port: number;
}

export interface Link {
  id: string;
  kind: LinkKind;
  a: LinkEnd;
  b: LinkEnd;
  label: string;
  colour: string;
  cableType: CableType;
}

export interface Layout {
  schemaVersion: number;
  /** null until a store has assigned one. */
  id: string | null;
  name: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  racks: Rack[];
  devices: Device[];
  links: Link[];
}

/** Device heights that can be placed, in rack units. */
export const UNIT_SIZES: readonly number[] = [0.5, 1, 2, 3, 4, 5, 6, 8];
export const RACK_UNIT_PRESETS: readonly number[] = [
  6, 9, 12, 15, 18, 24, 42, 47,
];
export const MAX_RACK_UNITS = 48;
export const RACK_WIDTHS: readonly RackWidth[] = [19, 10];

export const COLOURS: readonly string[] = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#64748b",
  "#8b5cf6",
];
