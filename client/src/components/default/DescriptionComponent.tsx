import React, {JSX} from "react";

type DescriptionProps =  {
    children: React.ReactNode,
    adClassName?: string
}

function Description({children, adClassName}: DescriptionProps): JSX.Element {
    return <p className={"paragraph text-2xl font-bold " + adClassName}>{children}</p>
}

export default Description