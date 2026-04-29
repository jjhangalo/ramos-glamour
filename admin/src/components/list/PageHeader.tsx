import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
