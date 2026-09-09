import { Check } from "lucide-react";

const STAGES = ["SUBMITTED", "PM_REVIEW", "WAITING", "IN_PROGRESS", "APPROVED"];

export function StatusStepper({ status }: { status: string }) {
  const currentIndex = STAGES.indexOf(status);

  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                  done
                    ? "bg-brand-600 text-white"
                    : current
                      ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={`hidden text-center text-[10px] font-medium sm:block ${
                  current ? "text-brand-700" : done ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {stage.replace(/_/g, " ")}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`mx-1.5 h-0.5 flex-1 rounded transition-colors ${done ? "bg-brand-600" : "bg-gray-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
