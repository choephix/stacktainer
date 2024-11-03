import { 
  upStack, 
  downStack, 
  restartStack, 
  stopStack, 
  getStackLogs 
} from '@/lib/api/docker-compose';

export async function POST(
  request: Request,
  { params }: { params: { stack: string } }
) {
  try {
    const { action } = await request.json();
    const fileName = params.stack;

    let result;
    switch (action) {
      case 'up':
        result = await upStack(fileName, { detach: true });
        break;
      case 'down':
        result = await downStack(fileName);
        break;
      case 'restart':
        result = await restartStack(fileName);
        break;
      case 'stop':
        result = await stopStack(fileName);
        break;
      case 'logs':
        result = await getStackLogs(fileName, { tail: 100 });
        break;
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Error executing stack action:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
