import React from "react";

interface BlueContainerBlockProps {
    BlockContent?: React.ReactNode;
    Heading?: React.ReactNode | null
    ShowHeading?: boolean
    AdditionalClass?: string
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
function BlueContainerBlock( {BlockContent, Heading, ShowHeading, AdditionalClass }: BlueContainerBlockProps) {


    return (
        <>
            <div className={AdditionalClass + ' display-flex flex-column blue-container'}>
                {ShowHeading && <BlockHeading Heading={Heading}/>}
                {BlockContent}
            </div>
        </>
    )
}

export default BlueContainerBlock;