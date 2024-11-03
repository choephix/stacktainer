import { readFile } from 'fs/promises';
import * as path from 'path';
import { getStacksInfo } from '@/lib/api/stacks';
import { 
  getContainers, 
  isDockerRunning,
  type DockerContainer 
} from '@/lib/api/docker';
import type { StackInfo } from '@/types/stacks';

interface StackContainer {
  serviceName: string;
  containerProps: {
    id: string;
    name: string;
    status: string;
    ports: string;
    created: string;
  } | null;
}

interface EnhancedStackInfo extends StackInfo {
  yamlContent?: string;
  containers: StackContainer[];
}

interface OverviewResponse {
  error?: string;
  isDockerRunning: boolean;
  stacks: EnhancedStackInfo[];
  stacklessContainers: DockerContainer[];
}

export async function GET() {
  try {
    const dockerRunning = await isDockerRunning();
    
    if (!dockerRunning) {
      return Response.json({
        isDockerRunning: false,
        stacks: [],
        stacklessContainers: [],
      } satisfies OverviewResponse);
    }

    // Fetch all data in parallel
    const [stacks, containers] = await Promise.all([
      getStacksInfo(),
      getContainers(),
    ]);

    // Read YAML content for existing files
    const stacksPath = process.env.STACKS_PATH;
    const enhancedStacks = await Promise.all(
      stacks.map(async (stack): Promise<EnhancedStackInfo> => {
        let yamlContent: string | undefined;
        
        if (stack.status !== 'compose_file_missing' && stacksPath) {
          try {
            yamlContent = await readFile(
              path.join(stacksPath, stack.fileName),
              'utf-8'
            );
          } catch {
            // File might have been deleted since getStacksInfo
          }
        }

        const services = stack.composeData?.services ? Object.keys(stack.composeData.services) : [];
        
        // Create container entries for all services
        const stackContainers = services.map(serviceKey => {
          // const containerName = stack.metadata?.containers?.[serviceName];
          const containerName = stack.metadata?.containers?.find(c => c.serviceKey === serviceKey)?.containerName;
          const runningContainer = containerName 
            ? containers.find(c => c.name === containerName)
            : null;

          return {
            serviceName: serviceKey,
            containerProps: runningContainer ? {
              id: runningContainer.id,
              name: runningContainer.name,
              status: runningContainer.status,
              ports: runningContainer.ports,
              created: runningContainer.created,
            } : null,
          } satisfies StackContainer;
        });

        return {
          ...stack,
          yamlContent,
          containers: stackContainers,
        };
      })
    );

    // Find containers that don't belong to any stack
    const stackContainerNames = new Set(
      enhancedStacks.flatMap(stack => 
        stack.containers
          .map(container => container.containerProps?.name)
          .filter((name): name is string => !!name)
      )
    );

    const stacklessContainers = containers.filter(
      container => !stackContainerNames.has(container.name)
    );

    return Response.json({
      isDockerRunning: true,
      stacks: enhancedStacks,
      stacklessContainers,
    } satisfies OverviewResponse);

  } catch (error) {
    console.error('Error fetching overview:', error);
    return Response.json(
      {
        error: 'Internal server error',
        isDockerRunning: false,
        stacks: [],
        stacklessContainers: [],
      } satisfies OverviewResponse,
      { status: 500 }
    );
  }
} 
