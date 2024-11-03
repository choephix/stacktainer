import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import type { StackMetadata } from '@/types/stacks';

export async function getMetadata(): Promise<{ stacks: Record<string, StackMetadata> }> {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const metaDataPath = path.join(stacksPath, '.stacktainer', 'meta.yaml');
  try {
    const content = await fs.readFile(metaDataPath, 'utf8');
    const metadata = YAML.parse(content);
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
  await fs.writeFile(metaDataPath, YAML.stringify(metadata), 'utf8');
}

export async function updateStackMetadata(
  fileName: string,
  containers: Array<{
    serviceKey: string;
    containerName: string;
    containerId: string;
    status: string;
  }> | null
) {
  const metadata = await getMetadata();

  if (containers === null) {
    // Stack is being removed
    delete metadata.stacks[fileName];
  } else {
    // Update or add stack metadata
    metadata.stacks[fileName] = {
      stackFile: fileName,
      containers,
      lastUpdated: new Date().toISOString(),
    };
  }

  await saveMetadata(metadata);
}

export async function removeStackMetadata(fileName: string) {
  await updateStackMetadata(fileName, null);
}
