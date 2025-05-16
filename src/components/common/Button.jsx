const Button = ({ type, className, icon, label, onClick, disabled }) => {
  return (
    <>
      <button
        type={type}
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {label} {icon && icon}{" "}
      </button>
    </>
  );
};

export default Button;