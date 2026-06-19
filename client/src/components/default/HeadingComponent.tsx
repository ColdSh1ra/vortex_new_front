import React from "react";

interface HeadingProps {
    children: React.ReactNode,
    className?: string
}

function Heading({children, className}: HeadingProps) {
    return <h1 className={"text-2xl font-bold" + className}>{children}</h1>
}

export default Heading