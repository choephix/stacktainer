import { getComposeFiles, readComposeFile } from '@/lib/api/compose';
import { getMetadata } from '@/lib/api/metadata';
import type { StackInfo } from '@/types/stacks';

export async function getStacksInfo() {
  // Get compose files and metadata
  const [yamlFiles, { stacks: stacksMetaData }] = await Promise.all([
    getComposeFiles(),
    getMetadata(),
  ]);

  console.log('stacksMetaData', stacksMetaData);

  // Process each yaml file
  const stackFilePromises = yamlFiles.map(async (fileName): Promise<StackInfo> => {
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

  const stacks = [...(await Promise.all(stackFilePromises)), ...missingFiles];

  return stacks as StackInfo[];
}
