import { readComposeFile } from '@/lib/api/compose';
import * as YAML from 'yaml';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ stack: string }> }
) {
  try {
    const fileName = (await params).stack;
    const fileData = await readComposeFile(fileName);
    
    if (!fileData?.content) {
      return new Response('Stack not found', { status: 404 });
    }

    const yamlContent = YAML.stringify(fileData.content);
    return new Response(yamlContent, {
      headers: {
        'Content-Type': 'text/yaml',
      },
    });
  } catch (error) {
    console.error('Error reading stack YAML:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 
