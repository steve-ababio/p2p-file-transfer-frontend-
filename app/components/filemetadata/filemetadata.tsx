interface FileMetaDataProps{
    filename: string,
    filesize: number,
    unit:string,
    sendFile:()=>void
}

export default function FileMetaData({filename,filesize,unit,sendFile}:FileMetaDataProps){
    return(
        <div>
            <div className="mb-2 animate-reveal text-slate-500 max-w-[24rem] text-ellipsis whitespace-nowrap overflow-clip">filename: {filename}</div>
            <div className="mb-2 text-slate-500 animate-reveal">
                <span>size: </span>{filesize}{unit}
            </div>
            <button onClick={sendFile} className="animate-reveal mb-2 focus-visible:outline-10 focus-visible:outline-offset-2 focus-visible:outline-blue-600/30 bg-blue-500 hover:shadow-md hover:shadow-blue-400/70 duration-300 text-white px-10 py-[6px] rounded-[4px]">Send</button>
      </div>
    )
}