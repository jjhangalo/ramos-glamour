import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  className?: string;
};

export function PageHeader({ title, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6", className)}>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
    </header>
  );
}
