import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

interface ComposeCommandOptions {
  detach?: boolean;
  buildImages?: boolean;
  removeOrphans?: boolean;
  timeout?: number;
}

interface ComposeLogOptions {
  tail?: number;
  follow?: boolean;
  timestamps?: boolean;
}

async function execCompose(fileName: string, command: string) {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const filePath = path.join(stacksPath, fileName);
  
  try {
    const { stdout, stderr } = await execAsync(`docker compose -f "${filePath}" ${command}`);
    return { success: true, output: stdout.trim(), error: stderr.trim() };
  } catch (error) {
    console.error(`Docker Compose command failed: ${command}`, error);
    return { 
      success: false, 
      output: '', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function upStack(
  fileName: string, 
  options: ComposeCommandOptions = {}
) {
  const flags = [
    options.detach ? '-d' : '',
    options.buildImages ? '--build' : '',
    options.removeOrphans ? '--remove-orphans' : '',
    options.timeout ? `--timeout ${options.timeout}` : '',
  ].filter(Boolean).join(' ');

  return execCompose(fileName, `up ${flags}`);
}

export async function downStack(
  fileName: string,
  options: ComposeCommandOptions = {}
) {
  const flags = [
    options.timeout ? `--timeout ${options.timeout}` : '',
    options.removeOrphans ? '--remove-orphans' : '',
  ].filter(Boolean).join(' ');

  return execCompose(fileName, `down ${flags}`);
}

export async function pullStack(fileName: string) {
  return execCompose(fileName, 'pull');
}

export async function getStackLogs(
  fileName: string,
  options: ComposeLogOptions = {}
) {
  const flags = [
    options.tail !== undefined ? `--tail ${options.tail}` : '',
    options.follow ? '--follow' : '',
    options.timestamps ? '--timestamps' : '',
  ].filter(Boolean).join(' ');

  return execCompose(fileName, `logs ${flags}`);
}

export async function getStackPs(fileName: string) {
  return execCompose(fileName, 'ps --format json');
}

export async function restartStack(
  fileName: string,
  options: ComposeCommandOptions = {}
) {
  const flags = [
    options.timeout ? `--timeout ${options.timeout}` : '',
  ].filter(Boolean).join(' ');

  return execCompose(fileName, `restart ${flags}`);
}

export async function stopStack(
  fileName: string,
  options: ComposeCommandOptions = {}
) {
  const flags = [
    options.timeout ? `--timeout ${options.timeout}` : '',
  ].filter(Boolean).join(' ');

  return execCompose(fileName, `stop ${flags}`);
} 
