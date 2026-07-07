import React from "react";

interface HeadingProps {
    children: React.ReactNode,
    adClassName?: string
}

function Heading({children, adClassName}: HeadingProps) {
    return <h1 className={"heading text-2xl font-bold " + adClassName}>{children}</h1>
}

export default Heading