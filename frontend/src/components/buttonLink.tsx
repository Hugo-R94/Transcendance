import type { ReactNode } from "react";

type ButtonProps = {
  link?: string;
  color: string;
  children?: ReactNode;
};

function ButtonLink({ link, children, color }: ButtonProps) {
  return (
    <a href={link} className="h-full w-30 ml-1.5 mr-1.5">
      <button className={`flex items-center hover:z-999 justify-center h-full w-30 ${color} balatro mx-2 ml-1.5 rounded-xl shadow-sm shadow-black hover:outline-2 hover:outline-white active:scale-90`}>
        {children}
      </button>
    </a>
  );
}

export default ButtonLink;