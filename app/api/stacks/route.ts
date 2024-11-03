import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'yaml';
import type { ComposeFile, StackMetadata, StackInfo, StacksResponse } from '@/types/stacks';

async function readYamlFile(filePath: string, defaultValue: unknown = null) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return parse(content);
  } catch (error) {
    return defaultValue;
  }
}

async function isComposeFile(data: unknown): Promise<boolean> {
  if (!data || typeof data !== 'object') return false;
  return 'services' in data;
}

export async function GET() {
  try {
    const stacksPath = process.env.STACKS_PATH;

    console.log('stacksPath', stacksPath);

    if (!stacksPath) {
      return Response.json(
        {
          error: 'STACKS_PATH not configured',
          stacks: [],
        } as StacksResponse,
        { status: 500 }
      );
    }

    // Read all yaml files in directory
    const files = await fs.readdir(stacksPath);
    const yamlFiles = files.filter(f => /\.ya?ml$/.test(f));

    // Read metadata file if it exists
    const metaDataPath = path.join(stacksPath, '.stacktainer', 'meta.yaml');
    const metaData = await readYamlFile(metaDataPath, {});
    const stacksMetaData = metaData.stacks || {};

    // Process each yaml file
    const stackPromises = yamlFiles.map(async (fileName): Promise<StackInfo> => {
      const filePath = path.join(stacksPath, fileName);
      const content = await readYamlFile(filePath);
      const isCompose = content ? await isComposeFile(content) : false;

      return {
        fileName,
        status: stacksMetaData[fileName] ? 'up' : 'not_up',
        isComposeFile: isCompose,
        metadata: stacksMetaData[fileName],
        composeData: isCompose ? (content as ComposeFile) : undefined,
      };
    });

    // Add missing files from metadata
    const metaFileNames = Object.keys(stacksMetaData);
    const missingFiles = metaFileNames
      .filter(metaFile => !yamlFiles.includes(metaFile))
      .map(
        (fileName): StackInfo => ({
          fileName,
          status: 'compose_file_missing',
          isComposeFile: true,
          metadata: stacksMetaData[fileName],
        })
      );

    const stacks = [...(await Promise.all(stackPromises)), ...missingFiles];

    return Response.json({ stacks } as StacksResponse);
  } catch (error) {
    console.error('Error processing stacks:', error);
    return Response.json(
      {
        error: 'Internal server error',
        stacks: [],
      } as StacksResponse,
      { status: 500 }
    );
  }
}
