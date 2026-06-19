import React from "react";

interface DescriptionProps {
    children: React.ReactNode,
    className?: string
}

function Description({children, className}: DescriptionProps) {
    return <p className={"text-2xl font-bold" + className}>{children}</p>
}

export default Description