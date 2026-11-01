import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { ProjectData } from '@/types/takeoff';
import { INITIAL_PROJECTS } from '@/lib/storage';

// Local storage directory on the computer: C:\Users\<Username>\Documents\CEI_Estimation\Projects
function getLocalProjectsDir(): string {
  try {
    const docs = path.join(os.homedir(), 'Documents', 'CEI_Estimation', 'Projects');
    return docs;
  } catch {
    return path.join(process.cwd(), 'data', 'projects');
  }
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}

// GET: Read all project files directly from the computer's hard drive
export async function GET() {
  const dir = getLocalProjectsDir();
  await ensureDir(dir);

  try {
    const files = await fs.readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith('.json') || f.endsWith('.cei'));

    // If folder is newly created or empty, initialize with default seed projects
    if (jsonFiles.length === 0) {
      for (const proj of INITIAL_PROJECTS) {
        const filePath = path.join(dir, `${proj.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(proj, null, 2), 'utf-8');
      }
      return NextResponse.json({
        storagePath: dir,
        projects: INITIAL_PROJECTS,
      });
    }

    const projects: ProjectData[] = [];
    for (const f of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(dir, f), 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && parsed.id && parsed.name) {
          projects.push(parsed);
        }
      } catch (err) {
        console.warn(`Could not read project file ${f}:`, err);
      }
    }

    // Sort by most recently updated
    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      storagePath: dir,
      projects,
    });
  } catch (err) {
    console.error('Failed to load local projects from computer:', err);
    return NextResponse.json(
      { error: 'Failed to read local files', projects: INITIAL_PROJECTS },
      { status: 500 }
    );
  }
}

// POST: Save project file directly to the computer's hard drive
export async function POST(req: NextRequest) {
  const dir = getLocalProjectsDir();
  await ensureDir(dir);

  try {
    const project: ProjectData = await req.json();
    if (!project || !project.id) {
      return NextResponse.json({ error: 'Invalid project payload' }, { status: 400 });
    }

    project.updatedAt = new Date().toISOString();

    // File name: [project-id].json
    const filename = `${project.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    const filePath = path.join(dir, filename);

    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Project saved directly to computer disk',
      filePath,
      storageDirectory: dir,
      project,
    });
  } catch (err) {
    console.error('Failed to save project to computer:', err);
    return NextResponse.json({ error: 'Failed to write project to disk' }, { status: 500 });
  }
}

// DELETE: Remove project file from the computer's hard drive
export async function DELETE(req: NextRequest) {
  const dir = getLocalProjectsDir();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
  }

  try {
    const filename = `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    const filePath = path.join(dir, filename);
    await fs.unlink(filePath);
    return NextResponse.json({ success: true, message: `Deleted ${filename}` });
  } catch (err) {
    console.error(`Failed to delete project ${id}:`, err);
    return NextResponse.json({ error: 'File not found or delete failed' }, { status: 500 });
  }
}

