import HeadingComponent from "./HeadingComponent";
import DescriptionComponent from "./DescriptionComponent";

interface TextContainerProps {
    Heading: string,
    Description: string
    ContainerClass: string | '',
    HeadingClass: string | ''
    DescriptionClass: string | ''

}

function TextContainer({Heading, Description, ContainerClass, HeadingClass, DescriptionClass}: TextContainerProps) {
    return (
        <>
            <div className={ContainerClass + 'heading'}>
                <HeadingComponent
                    children={Heading}
                    className={HeadingClass}/>
                <DescriptionComponent
                    children={Description}
                    className={DescriptionClass}/>
            </div>
        </>
    )

}

export default TextContainer;
