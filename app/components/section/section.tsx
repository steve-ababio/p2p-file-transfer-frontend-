import { twMerge } from "tailwind-merge"

interface SectionProps{
    className?:string,
    children:React.ReactNode
}
export default function Section({className,children}:SectionProps){
    return(
        <section className={twMerge("pl-5 flex border text-[14px] rounded-[3px] border-slate-300/60",className)}>
            {children}
        </section>
    )
}