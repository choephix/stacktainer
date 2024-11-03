import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { updateStackMetadata, removeStackMetadata } from './metadata';

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

async function parseComposePs(output: string) {
  console.log('parseComposePs', output);  

  const jsonStrings = output.split('\n').filter(Boolean);
  const jsons = jsonStrings.map(json => JSON.parse(json));
  return jsons.map(container => {
    try {
      return {
        serviceKey: container.Service,
        containerId: container.ID,
        containerName: container.Name,
        containerImage: container.Image,
        status: container.State,
      };
    } catch (error) {
      throw new Error(`Error parsing compose ps output: ${error}`);
    }
  });
}

async function execCompose(fileName: string, command: string, parseJson = false) {
  const stacksPath = process.env.STACKS_PATH;
  if (!stacksPath) {
    throw new Error('STACKS_PATH not configured');
  }

  const filePath = path.join(stacksPath, fileName);
  const fullCommand = `docker compose -f "${filePath}" ${command}`;

  console.log(`
    ------------------execCompose
    ${fullCommand}
  `);

  try {
    const { stdout, stderr } = await execAsync(fullCommand);
    return {
      success: true,
      output: parseJson ? JSON.parse(stdout.trim()) : stdout.trim(),
      error: stderr.trim(),
    };
  } catch (error) {
    console.error(`Docker Compose command failed: ${command}`, error);
    return {
      success: false,
      output: parseJson ? [] : '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function upStack(fileName: string, options: ComposeCommandOptions = {}) {
  const flags = [
    options.detach ? '-d' : '',
    options.detach ? '-d' : '',
    options.buildImages ? '--build' : '',
    options.removeOrphans ? '--remove-orphans' : '',
    options.timeout ? `--timeout ${options.timeout}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const result = await execCompose(fileName, `up ${flags}`);

  if (result.success) {
    // Get container status after up
    const psResult = await execCompose(fileName, 'ps --format json');
    if (psResult.success) {
      const containers = await parseComposePs(psResult.output);
      await updateStackMetadata(fileName, containers);
    }
  }

  return result;
}

export async function downStack(fileName: string, options: ComposeCommandOptions = {}) {
  const flags = [
    options.timeout ? `--timeout ${options.timeout}` : '',
    options.removeOrphans ? '--remove-orphans' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const result = await execCompose(fileName, `down ${flags}`);

  if (result.success) {
    await removeStackMetadata(fileName);
  }

  return result;
}

export async function pullStack(fileName: string) {
  return execCompose(fileName, 'pull');
}

export async function getStackLogs(fileName: string, options: ComposeLogOptions = {}) {
  const flags = [
    options.tail !== undefined ? `--tail ${options.tail}` : '',
    options.follow ? '--follow' : '',
    options.timestamps ? '--timestamps' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return execCompose(fileName, `logs ${flags}`);
}

export async function getStackPs(fileName: string) {
  return execCompose(fileName, 'ps --format json');
}

export async function restartStack(fileName: string, options: ComposeCommandOptions = {}) {
  const flags = [options.timeout ? `--timeout ${options.timeout}` : ''].filter(Boolean).join(' ');

  return execCompose(fileName, `restart ${flags}`);
}

export async function stopStack(fileName: string, options: ComposeCommandOptions = {}) {
  const flags = [options.timeout ? `--timeout ${options.timeout}` : ''].filter(Boolean).join(' ');

  const result = await execCompose(fileName, `stop ${flags}`);

  if (result.success) {
    // Update container statuses after stop
    const psResult = await execCompose(fileName, 'ps --format json');
    if (psResult.success) {
      const containers = await parseComposePs(psResult.output);
      await updateStackMetadata(fileName, containers);
    }
  }

  return result;
}
