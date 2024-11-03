import type { DockerContainer } from '@/lib/api/docker';
import type { StackInfo } from './stacks';

export interface EnhancedStackInfo extends StackInfo {
  yamlContent?: string;
  containers: {
    serviceName: string;
    containerProps: {
      id: string;
      name: string;
      status: string;
      ports: string;
      created: string;
    } | null;
  }[];
}

export interface OverviewResponse {
  error?: string;
  isDockerRunning: boolean;
  stacks: EnhancedStackInfo[];
  stacklessContainers: DockerContainer[];
} 
