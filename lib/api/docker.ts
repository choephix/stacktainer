import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DockerResource {
  id: string;
  name: string;
  created: string;
}

export interface DockerContainer extends DockerResource {
  status: string;
  ports: string;
}

export interface DockerVolume extends DockerResource {
  driver: string;
  mountpoint: string;
}

export interface DockerNetwork extends DockerResource {
  driver: string;
  scope: string;
}

export interface DockerImage extends DockerResource {
  size: string;
  tag: string;
}

async function execDocker(command: string) {
  try {
    const { stdout } = await execAsync(`docker ${command}`);
    return stdout.trim();
  } catch (error) {
    console.error(`Docker command failed: docker ${command}`, error);
    return '';
  }
}

// Format: "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}"
export async function getContainers() {
  const format = '{{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Ports}}\\t{{.CreatedAt}}';
  const output = await execDocker(`ps -a --format "${format}"`);
  
  if (!output) return [];
  
  return output.split('\n').map(line => {
    const [id, name, status, ports, created] = line.split('\t');
    return {
      id,
      name,
      status,
      ports,
      created,
    } satisfies DockerContainer;
  });
}

// Format: "{{.Name}}\t{{.Driver}}\t{{.Mountpoint}}\t{{.CreatedAt}}"
export async function getVolumes() {
  const format = '{{.Name}}\\t{{.Driver}}\\t{{.Mountpoint}}\\t{{.CreatedAt}}';
  const output = await execDocker(`volume ls --format "${format}"`);
  
  if (!output) return [];
  
  return output.split('\n').map(line => {
    const [name, driver, mountpoint, created] = line.split('\t');
    return {
      id: name, // Volumes use name as ID
      name,
      driver,
      mountpoint,
      created,
    } satisfies DockerVolume;
  });
}

// Format: "{{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}\t{{.CreatedAt}}"
export async function getNetworks() {
  const format = '{{.ID}}\\t{{.Name}}\\t{{.Driver}}\\t{{.Scope}}\\t{{.CreatedAt}}';
  const output = await execDocker(`network ls --format "${format}"`);
  
  if (!output) return [];
  
  return output.split('\n').map(line => {
    const [id, name, driver, scope, created] = line.split('\t');
    return {
      id,
      name,
      driver,
      scope,
      created,
    } satisfies DockerNetwork;
  });
}

// Format: "{{.ID}}\t{{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
export async function getImages() {
  const format = '{{.ID}}\\t{{.Repository}}:{{.Tag}}\\t{{.Size}}\\t{{.CreatedAt}}';
  const output = await execDocker(`images --format "${format}"`);
  
  if (!output) return [];
  
  return output.split('\n').map(line => {
    const [id, nameTag, size, created] = line.split('\t');
    const [name, tag] = nameTag.split(':');
    return {
      id,
      name,
      tag,
      size,
      created,
    } satisfies DockerImage;
  });
}

// Helper to check if Docker daemon is running
export async function isDockerRunning() {
  try {
    await execAsync('docker info');
    return true;
  } catch {
    return false;
  }
} 
