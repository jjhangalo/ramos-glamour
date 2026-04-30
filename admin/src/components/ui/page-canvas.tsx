import { cn } from "@/lib/utils";

type PageCanvasProps = {
  children: React.ReactNode;
  size?: "form" | "list" | "wide";
  className?: string;
};

const sizes = {
  form: "max-w-4xl",
  list: "max-w-6xl",
  wide: "max-w-[1400px]",
};

export function PageCanvas({ 
  children, 
  size = "list", 
  className 
}: PageCanvasProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        sizes[size],
        "px-4 md:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
