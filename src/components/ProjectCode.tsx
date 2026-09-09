import { Hash } from "lucide-react";
import { formatProjectCode } from "@/lib/labels";

export function ProjectCode({ seq, className = "" }: { seq: number; className?: string }) {
  return (
    <span className={`chip bg-gray-100 font-mono text-gray-500 ${className}`}>
      <Hash size={10} />
      {formatProjectCode(seq)}
    </span>
  );
}
