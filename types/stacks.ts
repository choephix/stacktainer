import type { ParsedUrlQuery } from 'querystring'

export interface ServiceDefinition {
  image?: string
  build?: {
    context?: string
    dockerfile?: string
  }
  // Add other relevant docker-compose service properties as needed
}

export interface ComposeFile {
  services?: Record<string, ServiceDefinition>
  version?: string
}

export interface ContainerMetadata {
  serviceKey: string
  containerId: string
  containerName: string
  status: string
}

export interface StackMetadata {
  stackFile: string
  containers: ContainerMetadata[]
  lastUpdated: string
}

export interface StackInfo {
  fileName: string
  status: 'up' | 'not_up' | 'compose_file_missing'
  isComposeFile: boolean
  metadata?: StackMetadata
  composeData?: ComposeFile
}

export interface StacksResponse {
  stacks: StackInfo[]
  error?: string
} 
