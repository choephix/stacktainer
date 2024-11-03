import { 
  getContainers, 
  getVolumes, 
  getNetworks, 
  getImages, 
  isDockerRunning,
  type DockerContainer,
  type DockerVolume,
  type DockerNetwork,
  type DockerImage,
} from '@/lib/api/docker';

interface DockerResourcesResponse {
  error?: string;
  isDockerRunning: boolean;
  resources: {
    containers: DockerContainer[];
    volumes: DockerVolume[];
    networks: DockerNetwork[];
    images: DockerImage[];
  };
}

export async function GET() {
  try {
    const dockerRunning = await isDockerRunning();
    
    if (!dockerRunning) {
      return Response.json({
        error: 'Docker daemon is not running',
        isDockerRunning: false,
        resources: {
          containers: [],
          volumes: [],
          networks: [],
          images: [],
        },
      } satisfies DockerResourcesResponse);
    }

    // Fetch all resources in parallel
    const [containers, volumes, networks, images] = await Promise.all([
      getContainers(),
      getVolumes(),
      getNetworks(),
      getImages(),
    ]);

    return Response.json({
      isDockerRunning: true,
      resources: {
        containers,
        volumes,
        networks,
        images,
      },
    } satisfies DockerResourcesResponse);

  } catch (error) {
    console.error('Error fetching Docker resources:', error);
    return Response.json(
      {
        error: 'Internal server error',
        isDockerRunning: false,
        resources: {
          containers: [],
          volumes: [],
          networks: [],
          images: [],
        },
      } satisfies DockerResourcesResponse,
      { status: 500 }
    );
  }
} 
