type Status = 'success' | 'warning' | 'error' | 'pending' | 'idle';

const colorMap: Record<Status, string> = {
  success: 'bg-accent-green',
  warning: 'bg-accent-yellow',
  error: 'bg-accent-red',
  pending: 'bg-blue-400',
  idle: 'bg-subtle',
};

export function StatusDot({ status }: { status: Status }) {
  const animate = status === 'success' || status === 'pending';
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colorMap[status]} ${animate ? 'animate-pulse-dot' : ''}`}
    />
  );
}
