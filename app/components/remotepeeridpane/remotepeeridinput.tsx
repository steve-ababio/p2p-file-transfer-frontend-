import SecondaryButton from "../button/secondarybutton";
import SpinnerLoader from "../spinnerloader/spinnerloader";
interface RemotePeerIDprops{ 
    disabled: boolean,
    connectToPeer:()=>void,
    getPeerID:(e: React.ChangeEvent<HTMLInputElement>)=>void,
    connecting:boolean
}
export default function RemotePeerIDPane({disabled,connectToPeer,getPeerID,connecting}:RemotePeerIDprops){
    return(
        <div className="flex gap-x-4 items-center">
            <input
              type="text"
              onChange={getPeerID}
              placeholder="Enter Peer ID"              
              aria-required="true"
              className="py-1 pl-3 rounded-[4px] px-2 duration-300 bg-transparent border border-gray-400/60 focus:outline-2 focus:outline-blue-500/60"
            />
            <SecondaryButton
              disabled={disabled}
              className={`${disabled && "cursor-not-allowed"}`}
              onClick={connectToPeer}
            >
              Connect
            </SecondaryButton>
            {connecting && <SpinnerLoader />}
        </div>
    )
}