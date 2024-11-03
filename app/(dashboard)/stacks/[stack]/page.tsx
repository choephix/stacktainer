'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StackAction {
  action: 'up' | 'down' | 'restart' | 'stop' | 'logs';
}

export default function StackPage({ params }: { params: Promise<{ stack: string }> }) {
  const [yaml, setYaml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resolvedParams = use(params);
  
  useEffect(() => {
    fetch(`/api/stacks/${resolvedParams.stack}/yaml`)
      .then(res => res.text())
      .then(setYaml);
  }, [resolvedParams.stack]);

  const executeAction = useCallback(async (action: StackAction['action']) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stacks/${resolvedParams.stack}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Action failed');
      }
      
      toast.success(`Stack ${action} completed successfully`);
      
      // If it's logs, show them in a pre
      if (action === 'logs' && result.output) {
        setYaml(result.output);
      }
    } catch (error) {
      toast.error(`Failed to ${action} stack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.stack]);

  if (!yaml) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <Button 
          onClick={() => executeAction('up')}
          disabled={isLoading}
        >
          Compose Up
        </Button>
        <Button 
          onClick={() => executeAction('down')}
          disabled={isLoading}
          variant="outline"
        >
          Compose Down
        </Button>
        <Button 
          onClick={() => executeAction('restart')}
          disabled={isLoading}
          variant="outline"
        >
          Compose Restart
        </Button>
        <Button 
          onClick={() => executeAction('stop')}
          disabled={isLoading}
          variant="outline"
        >
          Stop Stack
        </Button>
        <Button 
          onClick={() => executeAction('logs')}
          disabled={isLoading}
          variant="outline"
        >
          Print Logs
        </Button>
      </div>

      <pre className="font-mono text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded">
        {yaml}
      </pre>
    </div>
  );
} 
