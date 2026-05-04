import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      <h1 className="heading-luxury text-4xl font-light text-brand-midnight">
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
