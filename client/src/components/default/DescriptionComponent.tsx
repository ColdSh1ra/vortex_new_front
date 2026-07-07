import React from "react";

interface DescriptionProps {
    children: React.ReactNode,
    adClassName?: string
}

function Description({children, adClassName}: DescriptionProps) {
    return <p className={"paragraph text-2xl font-bold " + adClassName}>{children}</p>
}

export default Description