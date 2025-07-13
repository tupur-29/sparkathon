import React from 'react';

function TimeRangeSelector({ value, onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  return (
    <select 
      className="form-input"
      value={value}
      onChange={handleChange}
    >
      <option value="7d">Last 7 Days</option>
      <option value="30d">Last 30 Days</option>
      <option value="90d">Last 90 Days</option>
      <option value="1y">Last Year</option>
    </select>
  );
}

export default TimeRangeSelector;
