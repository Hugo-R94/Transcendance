import type { ReactNode } from "react";

type ButtonProps = {
    variant?: "primary" | "danger";
    children?: ReactNode;
    onClick?: () => void;
};

function Button({ variant, children, onClick }: ButtonProps) {
	const color =
		variant === "primary"
			? "bg-blue-600 hover:bg-blue-700"
			: "bg-red-600 hover:bg-red-700";
			
    return (
		<button onClick={onClick}
			className={`rounded-lg px-5 py-2 font-semibold text-white ${color} hover:scale-105 active:scale-90`}
		>
			{children}
		</button>
    );
}

export default Button;