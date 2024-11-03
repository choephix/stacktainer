import { getStacksInfo } from '@/lib/api/stacks';
import type { StacksResponse } from '@/types/stacks';

export async function GET() {
  try {
    const stacks = await getStacksInfo();

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
