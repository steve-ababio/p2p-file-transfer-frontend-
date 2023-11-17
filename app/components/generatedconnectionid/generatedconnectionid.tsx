import React from "react";
import { HiCheckCircle } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";

interface GeneratedConnectionIDProps{
    connectID: string,
    copyPeerID:(e:React.MouseEvent)=>Promise<void>,
    tooltip:boolean
}
const  GeneratedConnectionID = React.forwardRef<HTMLSpanElement,GeneratedConnectionIDProps>(({copyPeerID,connectID,tooltip}:GeneratedConnectionIDProps,ref)=>{
    return (
        <div className="flex gap-x-3">
            <div className={`py-1 px-10 rounded-[4px] ${connectID !== ""&& 'bg-blue-300/20'}`}>
              <code ref={ref} className="text-slate-500 font-bold">
                {connectID}
              </code>
            </div>
            <div title="copy connection ID" className="relative">
              <div className={`absolute w-[7rem] h-[2rem] rounded-[4px] bg-green-500/80 duration-200 shadow-xl shadow-slate-400/30 -top-3 left-1/2 -translate-x-1/2 -translate-y-full text-white  ${tooltip ? 'scale-100':'scale-0'} `}>
                <div className="h-full w-[85%] mx-auto flex justify-evenly items-center">
                  <HiCheckCircle size={20}/>
                  <span>copied</span>
                </div>
              </div>
              <button
                onClick={copyPeerID}
                className="border hover:border-blue-600/80 focus-visible:ring-4 outline-none focus-visible:ring-blue-400/40 border-blue-400/70 rounded-[5px] cursor-pointer transition-transform duration-300 p-1"
              >
                <MdOutlineContentCopy
                  size={18}
                  className="text-blue-400/80 hover:scale-110 duration-300"
                />
              </button>
            </div>
          </div>
    )
});
GeneratedConnectionID.displayName = "GeneratedConnectionID";
export default GeneratedConnectionID;