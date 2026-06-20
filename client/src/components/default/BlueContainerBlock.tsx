import React from "react";

interface BlueContainerBlockProps {
    BlockContent?: React.ReactNode;
    Heading?: React.ReactNode | null
    ShowHeading?: boolean
}

function BlockHeading({Heading}: BlueContainerBlockProps) {
    if (Heading) {
        return (
            <>
                {Heading}
            </>
        )
    } else <></>
}
function BlueContainerBlock( {BlockContent, Heading, ShowHeading }: BlueContainerBlockProps) {


    return (
        <>
            <div className={'display-flex blue-container'}>
                {ShowHeading && <BlockHeading Heading={Heading}/>}
                {BlockContent}
            </div>
        </>
    )
}

export default BlueContainerBlock;