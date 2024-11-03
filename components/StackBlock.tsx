import { ContainerLine } from './ContainerLine';
import type { EnhancedStackInfo } from '@/types/api';

type StackBlockProps = {
  stack: EnhancedStackInfo;
  isSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
};

export function StackBlock({ stack, isSelected, onClick }: StackBlockProps) {
  const stackName = stack.fileName
    .replace(/\.ya?ml$/, '')
    .replace(/^docker-compose\./, '');

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded p-1 
        ${isSelected ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}
      `}
    >
      <h3 className='font-bold text-xs mb-1' style={{ fontVariant: 'small-caps' }}>
        {stackName}
      </h3>
      <div className='space-y-0.5'>
        {stack.containers.map(container => (
          <ContainerLine
            key={container.serviceName}
            name={container.serviceName}
            status={container.containerProps?.status ?? null}
          />
        ))}
      </div>
    </div>
  );
}
