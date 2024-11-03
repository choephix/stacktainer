'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { StackBlock } from '@/components/StackBlock';
import { ContainerLine } from '@/components/ContainerLine';
import type { OverviewResponse } from '@/types/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const selectedStack = pathname.startsWith('/stacks/') 
    ? pathname.replace('/stacks/', '')
    : null;

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
      <div className='w-64 border-r border-gray-200 dark:border-gray-800 p-2 overflow-y-auto'>
        {/* Stacks */}
        <div className='space-y-1'>
          {data.stacks.map(stack => {
            const stackName = stack.fileName
              .replace(/\.ya?ml$/, '')
              .replace(/^docker-compose\./, '');
              
            return (
              <StackBlock
                key={stack.fileName}
                stack={stack}
                isSelected={selectedStack === stackName}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/stacks/${stack.fileName}`);
                }}
              />
            );
          })}
        </div>

        {/* Separator */}
        {data.stacklessContainers.length > 0 && (
          <div className='my-2 border-t border-gray-200 dark:border-gray-800' />
        )}

        {/* Stackless Containers */}
        {data.stacklessContainers.length > 0 && (
          <div>
            <h3 className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-1'>
              Standalone Containers
            </h3>
            <div className='space-y-0.5'>
              {data.stacklessContainers.map(container => (
                <ContainerLine key={container.id} name={container.name} status={container.status} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        {children}
      </div>
    </div>
  );
}
