import { StatusDot } from './StatusDot';

type ContainerLineProps = {
  name: string;
  status: string | null;
};

export function ContainerLine({ name, status }: ContainerLineProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-sm">
      <StatusDot status={status} />
      <span className="truncate">{name}</span>
    </div>
  );
} 
