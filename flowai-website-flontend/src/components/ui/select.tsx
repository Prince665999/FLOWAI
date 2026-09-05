import { cn } from "@/lib/cn";

export default function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("store-input", className)} {...props}>
      {children}
    </select>
  );
}
