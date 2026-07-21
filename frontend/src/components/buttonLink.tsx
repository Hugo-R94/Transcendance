import type { ReactNode } from "react";

type ButtonProps = {
  link?: string;
  color: string;
  children?: ReactNode;
  className?: string;
};

function ButtonLink({ link, children, color, className }: ButtonProps) {
  return (
    <a href={link} className={`h-full sm:w-[10%]   ml-1.5  ${className}`}>
      <button className={`flex items-center hover:scale-105  justify-center h-full w-full ${color} balatro ml-1.5 rounded-xl shadow-sm shadow-black hover:outline-2 hover:outline-white active:scale-90 `}>
        {children}
      </button>
    </a>
  );
}

export default ButtonLink;