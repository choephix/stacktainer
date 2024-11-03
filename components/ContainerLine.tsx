import { StatusDot } from './StatusDot';

type ContainerLineProps = {
  name: string;
  status: string | null;
};

export function ContainerLine({ name, status }: ContainerLineProps) {
  return (
    <div className="flex items-center gap-1.5 px-1.5 py-0.5 text-xs">
      <StatusDot status={status} />
      <span className="truncate">{name}</span>
    </div>
  );
} 
