import { getMetadata } from '@/lib/api/metadata';
import { getComposeFiles, readComposeFile } from '@/lib/api/compose';
import type { StackInfo, StacksResponse } from '@/types/stacks';

export async function GET() {
  try {
    // Get compose files and metadata
    const [yamlFiles, { stacks: stacksMetaData }] = await Promise.all([
      getComposeFiles(),
      getMetadata(),
    ]);

    // Process each yaml file
    const stackPromises = yamlFiles.map(async (fileName): Promise<StackInfo> => {
      const fileData = await readComposeFile(fileName);

      return {
        fileName,
        status: stacksMetaData[fileName] ? 'up' : 'not_up',
        isComposeFile: fileData?.isCompose ?? false,
        metadata: stacksMetaData[fileName],
        composeData: fileData?.composeData,
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

    return Response.json({ stacks } satisfies StacksResponse);
  } catch (error) {
    console.error('Error processing stacks:', error);
    return Response.json(
      {
        error: 'Internal server error',
        stacks: [],
      } satisfies StacksResponse,
      { status: 500 }
    );
  }
}