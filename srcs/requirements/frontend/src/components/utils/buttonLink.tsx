import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonProps = {
  link?: string;
  color: string;
  children?: ReactNode;
  className?: string;
};

function ButtonLink({ link, children, color, className }: ButtonProps) {
  return (
    <Link to={link} className={`h-full sm:w-[10%]   ms-1.5  ${className}`}>
      <button className={`flex items-center hover:scale-105  justify-center h-full w-full ${color} balatro ms-1.5 rounded-xl shadow-sm shadow-black hover:outline-2 hover:outline-white active:scale-90 `}>
        {children}
      </button>
    </Link>
  );
}

export default ButtonLink;