import { Link } from "react-router-dom";
function CircleButtonLink(linkPath = '', imageUrl = '') {
    // ./../../public/imgs/circle-button.png

    return (
        <Link className="circle-button-link" to={linkPath}>
            <div className="circle-btn-inner-wrapper">
                <img src={imageUrl} alt="circle button" />
            </div>
        </Link>
    )
}


export default CircleButtonLink;