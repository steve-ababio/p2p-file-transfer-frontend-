import {FcInfo} from "react-icons/fc";
import {PiFilesThin} from "react-icons/pi"

interface FilePromptProps{
    peerID: string,
    visible:boolean,
    setAcceptTransfer:React.Dispatch<React.SetStateAction<"accept"|"decline"|"idle">>
}
export default function FilePrompt({peerID,visible,setAcceptTransfer}:FilePromptProps){
    function confirmFileTransfer(e:React.MouseEvent<HTMLButtonElement>){
        const targetelement = e.target as HTMLButtonElement;
        const accepttransfer = targetelement.dataset.accept! as "accept"|"decline"|"idle";
        setAcceptTransfer(accepttransfer);
    }
    return(
        <div className={`${visible ? 'scale-100':'scale-0'} duration-300 bg-white rounded-[5px] px-5 py-5 shadow-slate-400/20 shadow-lg w-[90%] max-w-[21rem] text-[14px] flex flex-col gap-y-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
          <div className="absolute -top-[20px] left-1/2 -translate-x-1/2">
            <FcInfo size={40} />
          </div>
          <div className="flex flex-col gap-y-2">
            <div>{peerID} wants to</div>
            <div className="flex items-center gap-x-4">
              <PiFilesThin size={20} /> 
              <span>send you a file</span>
            </div>
          </div>
          <div className="flex justify-between w-[80%] mx-auto text-gray-500 font-semibold">
            <button onClick={confirmFileTransfer} data-accept="accept"  className="bg-blue-300/40 outline-none px-6 py-2 duration-300 rounded-[4px] focus-visible:ring-2 focus-visible:ring-blue-600/50 hover:ring-2 hover:ring-blue-600/50">
              <span>Accept</span>
            </button>
            <button onClick={confirmFileTransfer} datatype="decline" className="bg-blue-300/40 rounded-[4px] px-6 duration-300 py-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 hover:ring-2 hover:ring-blue-600/50 hover:bg-gray-400/6">
              <span>Decline</span>
            </button>
          </div>         
        </div>
    )
}