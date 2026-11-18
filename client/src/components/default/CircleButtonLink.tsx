import Link from './LocalizedLink';
type CircleButtonLinkProps = {
    linkPath: string;
    imageUrl: string;
    label: string;
};

function CircleButtonLink({ linkPath, imageUrl, label }: CircleButtonLinkProps) {
    const icon = <div className="circle-btn-inner-wrapper display-flex align-content-center"><img src={imageUrl} alt="" /></div>;
    if (/^https:\/\//.test(linkPath)) {
        return <a className="circle-button-link" href={linkPath} aria-label={label} target="_blank" rel="noopener noreferrer">{icon}</a>;
    }
    return (
        <Link className="circle-button-link" to={linkPath} aria-label={label}>
            {icon}
        </Link>
    );
}


export default CircleButtonLink;
