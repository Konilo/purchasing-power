import PropTypes from "prop-types";

export default function AmountInput({ id, label, value, setAmount }) {
  const handleAmountChange = (event) => {
    setAmount(Number(event.target.value));
  };
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        onChange={handleAmountChange}
        value={value}
      />
    </div>
  );
}
AmountInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  setAmount: PropTypes.func.isRequired,
};
