import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaTimes,
  FaMapMarkerAlt,
  FaHistory,
  FaBuilding,
  FaSpinner,
} from 'react-icons/fa';
import { ROUTES } from '../../../constants/routes';
import { useCustomerLocation } from '../../../hooks/useCustomerLocation';
import { searchGeographicDestinations } from '../../../services/destinationSearch.service';
import './HeaderDestinationSearch.css';

const RECENT_KEY = 'makook_recent_destinations';

const getRecentDestinations = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentDestination = (dest) => {
  try {
    const existing = getRecentDestinations();
    const filtered = existing.filter((d) => (d.id || d.name) !== (dest.id || dest.name));
    const updated = [dest, ...filtered].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const HeaderDestinationSearch = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const { coords } = useCustomerLocation();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recentList, setRecentList] = useState(() => getRecentDestinations());
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleInputFocus = () => {
    setRecentList(getRecentDestinations());
    setIsOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced real geographic search effect
  useEffect(() => {
    const trimmed = query.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!trimmed || trimmed.length < 2) {
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await searchGeographicDestinations(trimmed, coords, controller.signal);
        setSearchResults(results);
        setIsSearching(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIsSearching(false);
          setSearchError('Geographic search unavailable.');
        }
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, coords]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(0);

    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
    }
  };

  // Combined list for keyboard navigation
  const currentFlattenedList = useMemo(() => {
    if (query.trim().length >= 2) {
      return searchResults;
    }
    return recentList;
  }, [query, searchResults, recentList]);

  const handleSelectDestination = (dest) => {
    const updatedRecents = saveRecentDestination(dest);
    setRecentList(updatedRecents);
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(0);
    navigate(ROUTES.NEW_ORDER, {
      state: { selectedDestination: dest },
    });
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < currentFlattenedList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : currentFlattenedList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentFlattenedList.length > 0 && currentFlattenedList[highlightedIndex]) {
        handleSelectDestination(currentFlattenedList[highlightedIndex]);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError(null);
    setHighlightedIndex(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderContent = () => {
    const trimmed = query.trim();

    if (!trimmed) {
      if (recentList.length > 0) {
        return (
          <div className="header-dest-section">
            <span className="header-dest-section-title">Recent Destinations</span>
            {recentList.map((dest, index) => {
              const keyStr = `recent-${dest.id || index}`;
              const isSel = highlightedIndex === index;
              const itemClass = `header-dest-item ${isSel ? 'header-dest-item--highlighted' : ''}`;

              return (
                <button
                  key={keyStr}
                  type="button"
                  className={itemClass}
                  role="option"
                  aria-selected={isSel}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectDestination(dest)}
                >
                  <div className="header-dest-item__icon-wrapper" aria-hidden="true">
                    <FaHistory />
                  </div>
                  <div className="header-dest-item__content">
                    <span className="header-dest-item__name">{dest.displayTitle || dest.name}</span>
                    <span className="header-dest-item__meta">
                      {dest.displaySub || dest.address}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        );
      }

      return (
        <div className="header-dest-hint">
          <FaMapMarkerAlt style={{ fontSize: '1.1rem', color: '#156b82' }} aria-hidden="true" />
          <p className="header-dest-hint__text">Search real delivery destinations...</p>
        </div>
      );
    }

    if (isSearching) {
      return (
        <div className="header-dest-hint" style={{ padding: '16px', textAlign: 'center' }}>
          <FaSpinner
            className="fa-spin"
            style={{ fontSize: '1.2rem', color: '#156b82' }}
            aria-hidden="true"
          />
          <p className="header-dest-hint__text" style={{ marginTop: '8px' }}>
            Searching real geographic places...
          </p>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="header-dest-no-results">
          <p className="header-dest-no-results__title">Search Unavailable</p>
          <p className="header-dest-no-results__sub">{searchError}</p>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="header-dest-section">
          <span className="header-dest-section-title">Real Geographic Places</span>
          {searchResults.map((dest, index) => {
            const keyStr = `geo-${dest.id || index}`;
            const isSel = highlightedIndex === index;
            const itemClass = `header-dest-item ${isSel ? 'header-dest-item--highlighted' : ''}`;

            return (
              <button
                key={keyStr}
                type="button"
                className={itemClass}
                role="option"
                aria-selected={isSel}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectDestination(dest)}
              >
                <div className="header-dest-item__icon-wrapper" aria-hidden="true">
                  <FaBuilding />
                </div>
                <div className="header-dest-item__content">
                  <span className="header-dest-item__name">{dest.displayTitle || dest.name}</span>
                  <span className="header-dest-item__meta">{dest.displaySub || dest.address}</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="header-dest-no-results">
        <p className="header-dest-no-results__title">No destinations found</p>
        <p className="header-dest-no-results__sub">
          Try typing a landmark, street name, or building title.
        </p>
      </div>
    );
  };

  return (
    <div className="header-dest-search" ref={containerRef}>
      <div className="header-dest-input-group">
        <FaSearch className="header-dest-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className="header-dest-input"
          placeholder="Search destination..."
          aria-label="Search destination"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
          value={query}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {Boolean(query) && (
          <button
            type="button"
            className="header-dest-clear-btn"
            aria-label="Clear destination search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            <FaTimes aria-hidden="true" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id="dest-search-dropdown"
          className="header-dest-dropdown"
          role="listbox"
          aria-label="Destination Suggestions"
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default HeaderDestinationSearch;
