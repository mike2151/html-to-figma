import React from 'react';

interface HtmlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const HtmlInput: React.FC<HtmlInputProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="html-input" className="block font-medium">
        HTML
      </label>
      <textarea
        id="html-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
        placeholder="Enter your HTML here..."
      />
    </div>
  );
};

export default HtmlInput;