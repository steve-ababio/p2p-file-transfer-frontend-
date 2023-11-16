
export default function ErrorDisplay({message}:{message:string}){
    return(
        <div className={`animate-reveal py-1 px-12 border-2 mt-2 w-fit border-red-500/50 bg-red-300/30 text-slate-600 rounded-[3px]`}>
              {message}
        </div>
    )
}