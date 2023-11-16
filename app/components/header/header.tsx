import React from "react"

interface HeaderProps extends React.HTMLAttributes<HTMLHeadingElement>{
    headinglevel:"h1"|"h2"|"h3"|"h4"|"h5"|"h6",
}

const HeaderElement = ({headinglevel,children,className}:HeaderProps)=>{
    const Heading = ({...props}:React.HtmlHTMLAttributes<HTMLHeadingElement>)=>React.createElement(headinglevel,props,children);
    return <Heading className={className}>{children}</Heading>
}
export default function Header({headinglevel,children}:HeaderProps){
    return(
        <HeaderElement headinglevel={headinglevel}>{children}</HeaderElement>
    )
}