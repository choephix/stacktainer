import { promises as fs } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import type { ComposeFile } from '@/types/stacks';

export async function isComposeFile(data: unknown): Promise<boolean> {
  if (!data || typeof data !== 'object') return false;
  return 'services' in data;
}

export async function getComposeFiles() {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const files = await fs.readdir(stacksPath);
  return files.filter(f => /\.ya?ml$/.test(f));
}

export async function readComposeFile(fileName: string) {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const filePath = path.join(stacksPath, fileName);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = YAML.parse(content);
    const isCompose = await isComposeFile(parsed);
    return {
      content: parsed,
      isCompose,
      composeData: isCompose ? (parsed as ComposeFile) : undefined,
    };
  } catch (error) {
    return null;
  }
}

export async function saveComposeFile(fileName: string, content: ComposeFile) {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const filePath = path.join(stacksPath, fileName);
  const yamlContent = YAML.stringify(content);

  try {
    await fs.writeFile(filePath, yamlContent, 'utf8');
    return true;
  } catch (error) {
    return false;
  }
}
