
interface ProgressBarProps{
    usertype:string,
    chunkedsizedelivered:number
}
export default function ProgressBar({usertype,chunkedsizedelivered}:ProgressBarProps){
    return (
        <div className="flex flex-col justify-center max-w-[23rem] px-5 py-6  bg-blue-200/20 my-4 rounded-[4px]">
            <div>{usertype === "sender" ? "sending file": "receiving file"}</div>
            <progress value={chunkedsizedelivered} max={100} className="block w-full h-[8px] [&::-moz-progress-bar]:bg-blue-300/40 [&::-webkit-progress-bar]:bg-blue-300/40 [&::-webkit-progress-value]:bg-blue-600/70 [&::-moz-progress-value]:bg-blue-600/70"></progress>
            <span className="text-end"> {Math.round(chunkedsizedelivered)}%</span>
      </div>
    )
}