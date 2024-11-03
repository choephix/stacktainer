'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';

export default function StackPage({ params }: { params: Promise<{ stack: string }> }) {
  const [yaml, setYaml] = useState<string | null>(null);
  const resolvedParams = use(params);
  
  useEffect(() => {
    // Add .yml extension when fetching
    fetch(`/api/stacks/${resolvedParams.stack}/yaml`)
      .then(res => res.text())
      .then(setYaml);
  }, [resolvedParams.stack]);

  if (!yaml) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <pre className="font-mono text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded">
        {yaml}
      </pre>
    </div>
  );
} 
