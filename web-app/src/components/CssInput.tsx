import React from 'react';

interface CssInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CssInput: React.FC<CssInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="css-input" className="block font-medium">
        CSS
      </label>
      <textarea
        id="css-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
        placeholder="Enter your CSS here..."
      />
    </div>
  );
};

export default CssInput;