// CEI Estimation LLC - Precision CAD Takeoff Type Definitions

export type ProductType = 
  | 'Roofing'
  | 'RoofScopeX'
  | 'Siding'
  | 'Gutter'
  | 'RoofingGutter'
  | 'Concrete'
  | 'Insulation'
  | 'Paint'
  | 'PaintPro';

export type ProjectStatus = 'New' | 'In_Progress' | 'Inspected' | 'Completed' | 'Failed';

export type DueDatePriority = 'Low' | 'Medium' | 'High' | 'Overdue';

export type EdgeType = 
  | 'Eave'
  | 'Ridge'
  | 'Hip'
  | 'Valley'
  | 'Rake'
  | 'StepFlashing'
  | 'HeadwallFlashing'
  | 'FlatDripEdge'
  | 'Clerestory'
  | 'Parapet'
  | 'Coping'
  | 'Gutter'
  | 'Downspout'
  | 'CornerTrim'
  | 'FasciaTrim'
  | 'StarterStrip'
  | 'Unassigned';

export interface EdgeColorConfig {
  type: EdgeType;
  label: string;
  color: string;
  dash?: number[];
  lineWidth?: number;
}

export const EDGE_CONFIGS: Record<EdgeType, EdgeColorConfig> = {
  Eave: { type: 'Eave', label: 'Eave', color: '#10B981' }, // Green
  Ridge: { type: 'Ridge', label: 'Ridge', color: '#EF4444' }, // Red
  Hip: { type: 'Hip', label: 'Hip', color: '#8B5CF6' }, // Purple
  Valley: { type: 'Valley', label: 'Valley', color: '#3B82F6' }, // Blue
  Rake: { type: 'Rake', label: 'Rake', color: '#F59E0B' }, // Amber
  StepFlashing: { type: 'StepFlashing', label: 'Step Flashing', color: '#06B6D4' }, // Cyan
  HeadwallFlashing: { type: 'HeadwallFlashing', label: 'Headwall Flashing', color: '#14B8A6' }, // Teal
  FlatDripEdge: { type: 'FlatDripEdge', label: 'Flat Drip Edge', color: '#EC4899' }, // Pink
  Clerestory: { type: 'Clerestory', label: 'Clerestory', color: '#A855F7' },
  Parapet: { type: 'Parapet', label: 'Parapet', color: '#64748B' }, // Slate
  Coping: { type: 'Coping', label: 'Coping', color: '#475569' },
  Gutter: { type: 'Gutter', label: 'Gutter LF', color: '#0284C7' },
  Downspout: { type: 'Downspout', label: 'Downspout LF', color: '#0369A1' },
  CornerTrim: { type: 'CornerTrim', label: 'Corner Trim', color: '#D97706' },
  FasciaTrim: { type: 'FasciaTrim', label: 'Fascia Trim', color: '#059669' },
  StarterStrip: { type: 'StarterStrip', label: 'Starter Strip', color: '#6366F1' },
  Unassigned: { type: 'Unassigned', label: 'Standard Line', color: '#94A3B8', dash: [4, 4] },
};

export type Point = [number, number]; // [x_world_ft, y_world_ft]

export interface ClassifiedEdge {
  id: string;
  p1: Point;
  p2: Point;
  type: EdgeType;
  lengthFt: number;
}

export interface TakeoffFacet {
  id: string;
  name: string; // e.g. "Roof Plane 1", "North Wall A"
  structure: string; // e.g. "Main Building", "Garage"
  vertices: Point[]; // ordered polygon loop
  pitch: string; // e.g. "6/12", "4/12", "Flat"
  footprintAreaSqFt: number;
  trueAreaSqFt: number;
  squares: number;
  isHighRoof?: boolean;
  elevationSide?: 'North' | 'South' | 'East' | 'West';
  cutouts?: Point[][]; // inner cutout polygons (chimneys, skylights, windows)
}

export type PunchItemType = 
  | 'PipeBoot'
  | 'BoxVent'
  | 'RidgeVentLF'
  | 'Chimney'
  | 'Skylight'
  | 'DownspoutDrop'
  | 'Endcap'
  | 'InsideCorner'
  | 'OutsideCorner'
  | 'DownspoutElbow'
  | 'HVAC_Curb';

export interface PunchItem {
  id: string;
  type: PunchItemType;
  position: Point;
  label: string;
  notes?: string;
}

export interface ScaleCalibration {
  isCalibrated: boolean;
  pixelsPerFoot: number;
  knownLengthFt: number;
  p1: Point | null;
  p2: Point | null;
  scaleLabel?: string; // e.g. '1" = 10\''
}

export interface FailSafeError {
  id: string;
  type: 'MISSING_POLYGON' | 'NEGATIVE_AREA' | 'ZERO_SLOPE' | 'UNCLOSED_LOOP' | 'SCALE_WARNING';
  severity: 'ERROR' | 'WARNING';
  message: string;
  location?: Point;
  facetId?: string;
  edgeId?: string;
}

export interface WasteMatrixItem {
  wastePercent: number; // e.g. 10 for 10%
  grossSquares: number;
  grossSqFt: number;
  isRecommended?: boolean;
}

export interface ProjectData {
  id: string;
  name: string;
  claimNumber: string;
  jobNumber: string;
  siteAddress: string;
  dateOfLoss: string;
  dueDate: string;
  productType: ProductType;
  status: ProjectStatus;
  primaryPitch: string;
  notes: string;
  hasReadNotes: boolean;
  scale: ScaleCalibration;
  whichNorthAngleDeg: number;
  planUrl?: string;
  planName?: string;
  facets: TakeoffFacet[];
  edges: ClassifiedEdge[];
  punchItems: PunchItem[];
  qcTimeSeconds: number;
  techTimeSeconds: number;
  createdAt: string;
  updatedAt: string;
}

