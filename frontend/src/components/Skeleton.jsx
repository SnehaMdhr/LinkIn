function Skeleton({ className = "", variant = "text" }) {
  const base = "animate-pulse bg-muted rounded-md";
  const variants = {
    text: "h-4 w-full",
    avatar: "h-10 w-10 rounded-full",
    card: "h-24 w-full rounded-xl",
    button: "h-9 w-24",
    title: "h-6 w-1/2",
    stat: "h-16 w-full rounded-xl",
  };

  return <div className={`${base} ${variants[variant] || variants.text} ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
      </div>
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
          <Skeleton variant="text" className="w-8 h-8" />
          <Skeleton variant="text" className="w-16" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
