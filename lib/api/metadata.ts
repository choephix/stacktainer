import { promises as fs } from 'fs';
import * as path from 'path';
import { parse, stringify } from 'yaml';
import type { StackMetadata } from '@/types/stacks';

export async function getMetadata(): Promise<{ stacks: Record<string, StackMetadata> }> {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const metaDataPath = path.join(stacksPath, '.stacktainer', 'meta.yaml');
  try {
    const content = await fs.readFile(metaDataPath, 'utf8');
    const metadata = parse(content);
    return {
      stacks: metadata.stacks || {},
    };
  } catch (error) {
    return { stacks: {} };
  }
}

export async function saveMetadata(metadata: { stacks: Record<string, StackMetadata> }) {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const metaDataPath = path.join(stacksPath, '.stacktainer', 'meta.yaml');
  await fs.mkdir(path.dirname(metaDataPath), { recursive: true });
  await fs.writeFile(metaDataPath, stringify(metadata), 'utf8');
} 
