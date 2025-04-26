import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import chroma from 'chroma-js';
import { useNavigate } from 'react-router-dom';

export default function Saved() {
  const [savedPalettes, setSavedPalettes] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const stored = localStorage.getItem('palettes');
    if (stored) {
      setSavedPalettes(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="app">
      <h1>💾 Your choices <Link to="/">
        <button style={{ marginBottom: '50px' }}>Go back</button>
      </Link></h1>

      <div className="saved-palettes">
        {savedPalettes.map((palette, i) => (
          <div key={i} className="saved-row">
            {palette.map((color, j) => (
              <div
              key={j}
              className="color-block small"
              style={{ backgroundColor: Array.isArray(color) ? chroma.hsl(...color).hex() : color }}
            >
              <span>
                {Array.isArray(color) ? chroma.hsl(...color).hex() : color}
              </span>
            </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
