import React, { Ref } from "react";
import { PiUploadThin } from "react-icons/pi";

interface SelectProps{
    selectFile:(e:React.ChangeEvent<HTMLInputElement>)=>void,
}
 const FileSelectInput = React.forwardRef<HTMLInputElement,SelectProps>(({selectFile}:SelectProps,ref)=>{
    return(
        <button className="w-fit group flex items-center border-2 rounded-[4px] border-blue-300/80 outline-none duration-300 focus-visible:ring-blue-400/30 focus-visible:ring-2">
            <label htmlFor="file"  className="items-center text-slate-500 h-full flex px-4 py-[0.4rem] cursor-pointer gap-x-2">
                <PiUploadThin  className="group-hover:scale-125 duration-500" size={25}  />
                <span>Select file</span>
            </label>
            <input
                onChange={selectFile}
                id="file"
                type="file"
                name="file"
                ref={ref}
            className="w-0 h-0 absolute"
            />
        </button>
    )
})

export default FileSelectInput;