import { useState } from 'react';
import './TagSelect.css';

export default function TagSelect({ value = [], onChange }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tag) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="tag-select-container">
      <div className="tag-list">
        {value.map(tag => (
          <span key={tag} className="tag-item">
            {tag}
            <span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
          </span>
        ))}
        <input
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入后按回车添加"
        />
      </div>
    </div>
  );
}
