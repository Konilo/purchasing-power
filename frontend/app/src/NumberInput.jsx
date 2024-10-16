import PropTypes from "prop-types";

export default function NumberInput({ id, label, value, setNumber }) {
  const handleNumberChange = (event) => {
    setNumber(Number(event.target.value));
  };
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" onChange={handleNumberChange} value={value} />
    </div>
  );
}
NumberInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  setNumber: PropTypes.func.isRequired,
};
