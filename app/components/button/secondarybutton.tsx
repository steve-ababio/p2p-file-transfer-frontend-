import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?:boolean
}
export default function SecondaryButton({ children,className,onClick,disabled }: ButtonProps) {
  return (
    <button
      id="secondary-btn"
      aria-disabled={disabled}
      disabled={disabled}
      className={twMerge(`overflow-x-clip border-2 py-1 rounded-[4px] px-5 ${disabled ? "border-slate-400/20 text-slate-500/40": "focus-visible:ring-blue-400/30 outline-none focus-visible:ring-2 border-blue-300/80 text-slate-500 relative before:block before:content-[''] before:absolute before:inset-0 before:-z-10 before:transition-transform before:bg-blue-400 before:translate-x-full hover:before:translate-x-0 before:w-full duration-300 before:h-full hover:text-white before:duration-300"}`,className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
