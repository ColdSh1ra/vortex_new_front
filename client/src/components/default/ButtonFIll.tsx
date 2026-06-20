function ButtonIconContainer({ btnIcon = "" }) {
  if (btnIcon !== "") {
    return (
      <div className="button-icon-container">
        <img src={btnIcon} alt="button explaining icon" />
      </div>
    );
  }
  return <></>;
}

function ButtonFill({
  btnText = "",
  btnFunction = () => {},
  btnIcon = "",
  dynamicClass = "",
}) {
  return (
    <>
      <button
        className={"button button-filled" + dynamicClass}
        onClick={btnFunction}
      >
        {btnText}
        <ButtonIconContainer btnIcon={btnIcon} />
      </button>
    </>
  );
}

export default ButtonFill;
