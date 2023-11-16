import PrimaryButton from "@/app/components/button/primarybutton";
import TextInput from "@/app/components/textinput/textinput";


export default function Login(){
    return(
        <div className="w-full min-h-screen flex justify-center items-center">
            <div className="w-full max-w-[30rem] md:shadow-md pt-6 pb-10 bg-white flex gap-6 flex-col items-center">
                <h2 className="text-slate-600 text-lg">Welcome</h2>
                <form className="flex flex-col gap-y-6 items-center w-[68%]">
                    <TextInput label="username" type="text" />
                    <TextInput label="password" type="password"/>
                    <PrimaryButton className="bg-blue-500 w-full text-white py-2">Login</PrimaryButton>
                </form>
            </div>
        </div>
    )
}