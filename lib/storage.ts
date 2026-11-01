// CEI Estimation LLC - Local Computer Filesystem Storage Engine
// Stores projects & files directly on the local computer's hard drive without any login or database.

import { ProjectData } from '../types/takeoff';

export const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: 'cei-proj-101',
    name: 'Northgate Medical Plaza - Commercial Re-Roof',
    claimNumber: 'CLM-2026-98124',
    jobNumber: 'JOB-CEI-4401',
    siteAddress: '1420 Northgate Parkway, Seattle, WA',
    dateOfLoss: '2026-09-18',
    dueDate: '2026-11-15',
    productType: 'Roofing',
    status: 'In_Progress',
    primaryPitch: '4/12',
    notes: 'Architectural shingle replacement. Multi-level low and standard pitch parapet tie-ins. Verify flashing at RTU curbs.',
    hasReadNotes: true,
    whichNorthAngleDeg: 0,
    planName: 'Northgate_Roof_Plan_A102.pdf',
    qcTimeSeconds: 1240,
    techTimeSeconds: 4320,
    scale: {
      isCalibrated: true,
      pixelsPerFoot: 14.5,
      knownLengthFt: 60,
      p1: [0, 0],
      p2: [60, 0],
      scaleLabel: '1" = 10\' (14.5 px/ft)',
    },
    facets: [
      {
        id: 'f-1',
        name: 'Main South Slope A',
        structure: 'Main Building',
        pitch: '4/12',
        vertices: [
          [10, 10],
          [70, 10],
          [70, 45],
          [10, 45],
        ],
        footprintAreaSqFt: 2100,
        trueAreaSqFt: 2213.4,
        squares: 22.13,
      },
      {
        id: 'f-2',
        name: 'Main North Slope B',
        structure: 'Main Building',
        pitch: '4/12',
        vertices: [
          [10, 45],
          [70, 45],
          [70, 80],
          [10, 80],
        ],
        footprintAreaSqFt: 2100,
        trueAreaSqFt: 2213.4,
        squares: 22.13,
      },
      {
        id: 'f-3',
        name: 'East Canopy Vestibule',
        structure: 'East Canopy',
        pitch: '6/12',
        vertices: [
          [70, 25],
          [95, 25],
          [95, 65],
          [70, 65],
        ],
        footprintAreaSqFt: 1000,
        trueAreaSqFt: 1118.0,
        squares: 11.18,
      },
      {
        id: 'f-4',
        name: 'Entry Gable Dormer',
        structure: 'Main Building',
        pitch: '8/12',
        vertices: [
          [30, 10],
          [50, 10],
          [40, 25],
        ],
        footprintAreaSqFt: 150,
        trueAreaSqFt: 180.28,
        squares: 1.80,
      },
    ],
    edges: [
      { id: 'e-1', p1: [10, 10], p2: [70, 10], type: 'Eave', lengthFt: 60 },
      { id: 'e-2', p1: [10, 80], p2: [70, 80], type: 'Eave', lengthFt: 60 },
      { id: 'e-3', p1: [10, 45], p2: [70, 45], type: 'Ridge', lengthFt: 60 },
      { id: 'e-4', p1: [10, 10], p2: [10, 45], type: 'Rake', lengthFt: 35 },
      { id: 'e-5', p1: [10, 45], p2: [10, 80], type: 'Rake', lengthFt: 35 },
      { id: 'e-6', p1: [70, 10], p2: [70, 25], type: 'Rake', lengthFt: 15 },
      { id: 'e-7', p1: [70, 65], p2: [70, 80], type: 'Rake', lengthFt: 15 },
      { id: 'e-8', p1: [70, 25], p2: [70, 65], type: 'StepFlashing', lengthFt: 40 },
      { id: 'e-9', p1: [95, 25], p2: [95, 65], type: 'Eave', lengthFt: 40 },
      { id: 'e-10', p1: [70, 25], p2: [95, 25], type: 'Rake', lengthFt: 25 },
      { id: 'e-11', p1: [70, 65], p2: [95, 65], type: 'Rake', lengthFt: 25 },
      { id: 'e-12', p1: [30, 10], p2: [40, 25], type: 'Valley', lengthFt: 18.03 },
      { id: 'e-13', p1: [50, 10], p2: [40, 25], type: 'Valley', lengthFt: 18.03 },
      { id: 'e-14', p1: [10, 10], p2: [70, 10], type: 'Gutter', lengthFt: 60 },
      { id: 'e-15', p1: [10, 80], p2: [70, 80], type: 'Gutter', lengthFt: 60 },
      { id: 'e-16', p1: [95, 25], p2: [95, 65], type: 'Gutter', lengthFt: 40 },
    ],
    punchItems: [
      { id: 'p-1', type: 'PipeBoot', position: [25, 30], label: '3" Plumbing Vent Boot' },
      { id: 'p-2', type: 'PipeBoot', position: [28, 32], label: '3" Plumbing Vent Boot' },
      { id: 'p-3', type: 'BoxVent', position: [55, 40], label: 'O\'Hagin Low Profile Box Vent' },
      { id: 'p-4', type: 'BoxVent', position: [62, 40], label: 'O\'Hagin Low Profile Box Vent' },
      { id: 'p-5', type: 'HVAC_Curb', position: [40, 60], label: 'RTU Mechanical Curb 4x4' },
      { id: 'p-6', type: 'DownspoutDrop', position: [10, 10], label: '3x4 Corrugated Downspout Drop' },
      { id: 'p-7', type: 'DownspoutDrop', position: [70, 10], label: '3x4 Corrugated Downspout Drop' },
      { id: 'p-8', type: 'DownspoutDrop', position: [10, 80], label: '3x4 Corrugated Downspout Drop' },
      { id: 'p-9', type: 'DownspoutDrop', position: [70, 80], label: '3x4 Corrugated Downspout Drop' },
    ],
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-11-01T14:30:00Z',
  },
  {
    id: 'cei-proj-102',
    name: 'Highland Estates - Residential Siding & Gutter',
    claimNumber: 'CLM-2026-44219',
    jobNumber: 'JOB-CEI-4402',
    siteAddress: '882 Highland Crest Court, Denver, CO',
    dateOfLoss: '2026-08-12',
    dueDate: '2026-11-20',
    productType: 'Siding',
    status: 'New',
    primaryPitch: '6/12',
    notes: 'Hail damage claim. James Hardie 8.25" Lap siding with ColorPlus finish. Replace all corner posts and frieze boards.',
    hasReadNotes: true,
    whichNorthAngleDeg: 45,
    planName: 'Highland_Elevations_Sheet_S2.pdf',
    qcTimeSeconds: 450,
    techTimeSeconds: 1800,
    scale: {
      isCalibrated: true,
      pixelsPerFoot: 16.0,
      knownLengthFt: 40,
      p1: [0, 0],
      p2: [40, 0],
      scaleLabel: '1/4" = 1\' (16 px/ft)',
    },
    facets: [
      {
        id: 'sid-1',
        name: 'North Elevation Wall A',
        structure: 'Main House',
        pitch: 'Flat',
        elevationSide: 'North',
        vertices: [
          [10, 10],
          [50, 10],
          [50, 32],
          [30, 44],
          [10, 32],
        ],
        footprintAreaSqFt: 1120,
        trueAreaSqFt: 1120,
        squares: 11.2,
      },
    ],
    edges: [
      { id: 'se-1', p1: [10, 10], p2: [50, 10], type: 'StarterStrip', lengthFt: 40 },
      { id: 'se-2', p1: [10, 10], p2: [10, 32], type: 'CornerTrim', lengthFt: 22 },
      { id: 'se-3', p1: [50, 10], p2: [50, 32], type: 'CornerTrim', lengthFt: 22 },
      { id: 'se-4', p1: [10, 32], p2: [30, 44], type: 'FasciaTrim', lengthFt: 23.32 },
      { id: 'se-5', p1: [50, 32], p2: [30, 44], type: 'FasciaTrim', lengthFt: 23.32 },
    ],
    punchItems: [
      { id: 'sp-1', type: 'InsideCorner', position: [10, 10], label: 'Inside Corner Post 10\'' },
      { id: 'sp-2', type: 'OutsideCorner', position: [50, 10], label: 'Outside Corner Post 10\'' },
    ],
    createdAt: '2026-10-30T11:15:00Z',
    updatedAt: '2026-10-31T16:00:00Z',
  },
  {
    id: 'cei-proj-103',
    name: 'Southwest Logistics Center - Concrete Foundation & Slab',
    claimNumber: 'CLM-2026-11883',
    jobNumber: 'JOB-CEI-4403',
    siteAddress: '3100 Industrial Parkway, Phoenix, AZ',
    dateOfLoss: '2026-07-04',
    dueDate: '2026-11-28',
    productType: 'Concrete',
    status: 'Inspected',
    primaryPitch: 'Flat',
    notes: 'Warehouse slab expansion. 6" post-tensioned slab with heavy duty perimeter grade beams.',
    hasReadNotes: true,
    whichNorthAngleDeg: 90,
    planName: 'Southwest_Foundation_C101.pdf',
    qcTimeSeconds: 2100,
    techTimeSeconds: 5400,
    scale: {
      isCalibrated: true,
      pixelsPerFoot: 8.0,
      knownLengthFt: 100,
      p1: [0, 0],
      p2: [100, 0],
      scaleLabel: '1" = 20\' (8 px/ft)',
    },
    facets: [
      {
        id: 'conc-1',
        name: 'Warehouse Slab Bay A',
        structure: 'Main Facility',
        pitch: 'Flat',
        vertices: [
          [20, 20],
          [120, 20],
          [120, 100],
          [20, 100],
        ],
        footprintAreaSqFt: 8000,
        trueAreaSqFt: 8000,
        squares: 80.0,
      },
    ],
    edges: [
      { id: 'ce-1', p1: [20, 20], p2: [120, 20], type: 'Eave', lengthFt: 100 },
      { id: 'ce-2', p1: [120, 20], p2: [120, 100], type: 'Eave', lengthFt: 80 },
      { id: 'ce-3', p1: [120, 100], p2: [20, 100], type: 'Eave', lengthFt: 100 },
      { id: 'ce-4', p1: [20, 100], p2: [20, 20], type: 'Eave', lengthFt: 80 },
    ],
    punchItems: [
      { id: 'cp-1', type: 'HVAC_Curb', position: [50, 50], label: 'Column Isolation Footing 6x6' },
      { id: 'cp-2', type: 'HVAC_Curb', position: [90, 50], label: 'Column Isolation Footing 6x6' },
    ],
    createdAt: '2026-10-25T14:00:00Z',
    updatedAt: '2026-10-29T18:20:00Z',
  },
];

const LOCAL_STORAGE_KEY = 'cei_estimation_projects_v1';

// 1. Load Projects from Computer Disk (via /api/projects) with localStorage fallback
export async function loadProjectsFromComputer(): Promise<{ projects: ProjectData[]; storagePath?: string }> {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.projects) && data.projects.length > 0) {
        return {
          projects: data.projects,
          storagePath: data.storagePath,
        };
      }
    }
  } catch (err) {
    console.warn('API /api/projects unreachable, falling back to local cache:', err);
  }

  // Fallback to localStorage or initial seeds
  return {
    projects: loadStoredProjects(),
  };
}

// 2. Save Project directly to Computer Hard Drive (via /api/projects POST)
export async function saveProjectToComputer(project: ProjectData): Promise<{ success: boolean; filePath?: string }> {
  // Always update localStorage first for instant offline responsiveness
  saveProject(project);

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (res.ok) {
      const result = await res.json();
      return { success: true, filePath: result.filePath };
    }
  } catch (err) {
    console.error('Failed to write project to local computer disk:', err);
  }

  return { success: false };
}

// 3. Export standalone .cei project file to any folder on computer
export function exportCeiProjectFile(project: ProjectData): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  const safeTitle = (project.claimNumber || project.name).replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${safeTitle}.cei.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

// 4. Open and read any .cei or .json project file from user's hard drive
export function openLocalProjectFile(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && parsed.id && parsed.name) {
          resolve(parsed as ProjectData);
        } else {
          reject(new Error('Invalid CEI project file structure.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

// Synchronous local browser cache operations
export function loadStoredProjects(): ProjectData[] {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECTS;
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
}

export function saveStoredProjects(projects: ProjectData[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

export function saveProject(project: ProjectData): void {
  const current = loadStoredProjects();
  const index = current.findIndex((p) => p.id === project.id);
  let updated: ProjectData[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    updated = [project, ...current];
  }
  saveStoredProjects(updated);
}
