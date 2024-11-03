type StatusDotProps = {
  status: string | null;
};

export function StatusDot({ status }: StatusDotProps) {
  let className = "w-1.5 h-1.5 rounded-full ";
  
  if (!status) {
    className += "border border-gray-400 dark:border-gray-600";
  } else if (status.toLowerCase().includes("running")) {
    className += "bg-green-500";
  } else {
    className += "bg-gray-400 dark:bg-gray-600";
  }
  
  return <div className={className} />;
} 
