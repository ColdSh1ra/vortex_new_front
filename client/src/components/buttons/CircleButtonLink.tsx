import { Link } from "react-router-dom";
type CircleButtonLinkProps = {
    linkPath: string;
    imageUrl: string;
};

function CircleButtonLink({ linkPath, imageUrl }: CircleButtonLinkProps) {
    return (
        <Link className="circle-button-link" to={linkPath}>
            <div className="circle-btn-inner-wrapper display-flex align-content-center">
                <img src={imageUrl} alt="circle button" />
            </div>
        </Link>
    );
}


export default CircleButtonLink;