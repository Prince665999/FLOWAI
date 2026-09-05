import { cn } from "@/lib/cn";

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("store-input", className)} {...props} />;
}
