import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalkInStepIndicatorProps {
  currentStep: number
}

const steps = [
  { number: 1, label: "Basic Visitor Information" },
  { number: 2, label: "Document Upload" },
  { number: 3, label: "QR Code Generation" },
  { number: 4, label: "Time Slot Booking" },
  { number: 5, label: "Host Selection" },
  { number: 6, label: "Visit Purpose" },
  { number: 7, label: "Quick Security Screening" },
]

export function WalkInStepIndicator({ currentStep }: WalkInStepIndicatorProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center min-w-max gap-1">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0",
                  currentStep > step.number
                    ? "bg-[#3b82f6] text-white"
                    : currentStep === step.number
                      ? "bg-[#3b82f6] text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  currentStep >= step.number
                    ? "text-[#3b82f6]"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-6 h-0.5 mx-1 shrink-0",
                  currentStep > step.number ? "bg-[#3b82f6]" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
