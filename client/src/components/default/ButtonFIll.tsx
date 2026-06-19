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
  bgColor = "",
  textColor = "",
  btnText = "",
  btnFunction = () => {},
  btnIcon = "",
  dynamicClass = "",
}) {
  return (
    <>
      <button
        className={"button btn-fill" + dynamicClass}
        onClick={btnFunction}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {btnText}
        <ButtonIconContainer btnIcon={btnIcon} />
      </button>
    </>
  );
}

export default ButtonFill;
