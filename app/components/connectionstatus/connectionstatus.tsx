
type ConnectionStatusProps ={
    connectionstate:string,
    remotepeerID:string
}
export default function ConnectionStatus({connectionstate,remotepeerID}:ConnectionStatusProps){
    return (
        <div className="py-5 flex flex-col justify-center text-[13px]">
            {
                connectionstate === "disconnected" ? (
                    <div className="bg-slate-300/30 text-slate-600 px-10 py-2 w-fit rounded-[8px]">
                    Awaiting a new connection...
                    </div>
                ) : connectionstate === "connected" ? (
                    <div className="bg-blue-300/20 text-blue-600 px-10 py-2 w-fit rounded-[8px]">
                    Connected to {remotepeerID}
                    </div>
                ) : (
                    connectionstate
                )
            }
          </div>
    )
}