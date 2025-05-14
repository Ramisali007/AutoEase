import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../assets/SearchBar.css';

/**
 * Reusable search bar component
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {function} props.onSearch - Function to call when search is performed
 * @param {string} props.initialValue - Initial value for the search input
 * @param {string} props.className - Additional CSS class for styling
 * @param {boolean} props.autoFocus - Whether to autofocus the input
 * @param {number} props.debounceTime - Debounce time in milliseconds (default: 300)
 * @param {boolean} props.showClearButton - Whether to show the clear button
 */
const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  initialValue = '',
  className = '',
  autoFocus = false,
  debounceTime = 300,
  showClearButton = true
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  // Handle input change
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debounceTime]);

  // Call onSearch when debounced search term changes
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  return (
    <form className={`search-bar-container ${className}`} onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          autoFocus={autoFocus}
        />
        {showClearButton && searchTerm && (
          <button
            type="button"
            className="clear-search-button"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
