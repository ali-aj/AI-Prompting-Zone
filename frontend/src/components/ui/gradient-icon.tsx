import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface GradientIconProps {
  icon: LucideIcon
  size?: "sm" | "md" | "lg"
  variant?: "blue-purple" | "blue-cyan" | "purple-pink" | "yellow-orange" | "green-emerald"
  className?: string
}

const sizeVariants = {
  sm: "w-10 h-10",
  md: "w-12 h-12", 
  lg: "w-16 h-16"
}

const variantStyles = {
  "blue-purple": "from-blue-500 to-purple-500",
  "blue-cyan": "from-blue-500 to-cyan-500",
  "purple-pink": "from-purple-500 to-pink-500", 
  "yellow-orange": "from-yellow-500 to-orange-500",
  "green-emerald": "from-green-500 to-emerald-500"
}

export function GradientIcon({ 
  icon: Icon, 
  size = "md", 
  variant = "blue-purple", 
  className 
}: GradientIconProps) {
  return (
    <div className={cn(
      "bg-gradient-to-r rounded-xl flex items-center justify-center shadow-lg text-white",
      sizeVariants[size],
      variantStyles[variant],
      className
    )}>
      <Icon className="w-6 h-6" />
    </div>
  )
}
