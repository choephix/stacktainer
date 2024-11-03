'use client';

import { useEffect, useState } from 'react';
import { StackBlock } from '@/components/StackBlock';
import { ContainerLine } from '@/components/ContainerLine';
import type { OverviewResponse } from '@/types/api';

export default function Home() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [selectedStack, setSelectedStack] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/overview')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <div className='w-80 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto'>
        {/* Stacks */}
        <div className='space-y-2'>
          {data.stacks.map(stack => (
            <StackBlock
              key={stack.fileName}
              stack={stack}
              isSelected={selectedStack === stack.fileName}
              onClick={() => {
                setSelectedStack(stack.fileName);
                console.log('Selected stack:', stack);
              }}
            />
          ))}
        </div>

        {/* Separator */}
        {data.stacklessContainers.length > 0 && (
          <div className='my-4 border-t border-gray-200 dark:border-gray-800' />
        )}

        {/* Stackless Containers */}
        {data.stacklessContainers.length > 0 && (
          <div>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 mb-2'>
              Standalone Containers
            </h3>
            <div className='space-y-1'>
              {data.stacklessContainers.map(container => (
                <ContainerLine key={container.id} name={container.name} status={container.status} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='flex-1 p-8'>
        <div className='text-center text-gray-500 dark:text-gray-400'>
          Select a stack to view details
        </div>
      </div>
    </div>
  );
}
