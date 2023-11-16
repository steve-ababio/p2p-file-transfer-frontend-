"use client"
import { useId } from "react"
import { twMerge } from "tailwind-merge";

interface TextInputProps{
    type:"text"|"password",
    label:string,
    className?:string,
}

export default function TextInput({type,label,className}:TextInputProps){
    const id = useId();
    return(
        <div className="flex flex-col w-full text-slate-600 ">
            <label id={id}>{label}</label>
            <input autoComplete="off" className={twMerge("py-2 focus:outline-2 focus:outline-blue-400 border-blue-400/30 border px-5",className)} type={type} id={id} name={label.replaceAll(" ","")} placeholder={label} />
        </div>
    )
}