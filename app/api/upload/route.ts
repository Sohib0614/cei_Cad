import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

function getLocalPlansDir(): string {
  try {
    return path.join(os.homedir(), 'Documents', 'CEI_Estimation', 'Plans');
  } catch {
    return path.join(process.cwd(), 'data', 'plans');
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const plansDir = getLocalPlansDir();
    await fs.mkdir(plansDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(plansDir, safeName);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Plan saved directly to computer',
      fileName: file.name,
      filePath,
      fileSize: file.size,
      storageDirectory: plansDir,
    });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Failed to save file to computer' }, { status: 500 });
  }
}

