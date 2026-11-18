import { statSync } from 'node:fs';
import { join } from 'node:path';
import { cv } from './profile';

// Server-only: reads the PDF from public/ at build time. Keep Node imports out of profile.ts,
// which the client script also imports.
export function getCvSize(): string {
  const file: string = join(process.cwd(), 'public', cv.path);
  let bytes: number;
  try {
    bytes = statSync(file).size;
  } catch {
    throw new Error(`Missing CV PDF at public/${cv.path}. Add the file before building.`);
  }
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
