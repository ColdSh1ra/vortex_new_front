import { Link } from "react-router-dom";
type CircleButtonLinkProps = {
    linkPath: string;
    imageUrl: string;
    label: string;
};

function CircleButtonLink({ linkPath, imageUrl, label }: CircleButtonLinkProps) {
    return (
        <Link className="circle-button-link" to={linkPath} aria-label={label}>
            <div className="circle-btn-inner-wrapper display-flex align-content-center">
                <img src={imageUrl} alt="" />
            </div>
        </Link>
    );
}


export default CircleButtonLink;