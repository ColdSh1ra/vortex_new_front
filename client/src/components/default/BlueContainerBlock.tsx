import React from "react";

interface BlueContainerBlockProps {
    BlockContent?: React.ReactNode;
    Heading?: React.ReactNode | null
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
function BlueContainerBlock( {BlockContent, Heading}: BlueContainerBlockProps) {


    return (
        <>
            <div className={'display-flex blue-container'}>
                <BlockHeading Heading={Heading}/>
                {BlockContent}
            </div>
        </>
    )
}

export default BlueContainerBlock;