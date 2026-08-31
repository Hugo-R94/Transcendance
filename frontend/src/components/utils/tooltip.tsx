import { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  className?: string;
}

export default function Tooltip({
  children,
  className = "",
}: TooltipProps) {
  return (
    <div
      className={`
        pointer-events-none
        absolute
        z-50
        left-1/2
        top-full
        mt-2
        -translate-x-1/2
        w-max
        max-w-xs
        whitespace-normal
        text-center
        rounded-lg
        bg-bdarkgreen
        card
        px-3
        py-2
        text-sm
        text-white
        shadow-lg
        opacity-0
        scale-0
        transition-all
        duration-150
        group-hover:opacity-100
        group-hover:scale-100
        ${className}
      `}
    >
      {children}
    </div>
  );
}