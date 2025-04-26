import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ralColors from '../data/ralColors.json';
import pantoneColors from '../data/pantoneColors.json';

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


import chroma from 'chroma-js'; // додай на початку файлу (далі поясню)

function generateScheme(baseColor, type) {
  const base = chroma(baseColor);

  switch (type) {
    case 'analogous':
      return chroma.scale(base.analogous(5).map(c => c.hex())).colors(5);

    case 'complementary':
      const comp = base.set('hsl.h', '+180');
      return chroma.scale([base, comp.hex()]).mode('lch').colors(5);

    case 'triad':
      return chroma.scale([
        base,
        base.set('hsl.h', '+120'),
        base.set('hsl.h', '-120')
      ]).colors(5);

    case 'tetrad':
      return chroma.scale(base.tetrad().map(c => c.hex())).colors(5);

    default:
      return Array.from({ length: 5 }, () => getRandomColor());
  }
}

function formatColor(color, format) {
  const c = chroma(color);
  switch (format) {
    case 'rgb':
      return c.css(); //rgb(255, 255, 255)
    case 'hsl':
      return c.css('hsl'); // hsl(0, 0%, 100%)
    case 'hex':
    default:
      return c.hex(); // #FFFFFF
    case 'cmyk':
      return convertToCMYK(c.hex()); // або .rgb()
    case 'ral':
        return findNearestRAL(c.hex());      
    case 'pantone':
      return findNearestPantone(c.hex());
  }
}

function hslToColor(hsl, format) {
  const color = chroma.hsl(...hsl);
  return formatColor(color, format);
}

function convertToCMYK(hex) {
    const rgb = chroma(hex).rgb(); // [r, g, b]
  
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
  
    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
  
    return `CMYK(${(c * 100).toFixed(0)}%, ${(m * 100).toFixed(0)}%, ${(y * 100).toFixed(0)}%, ${(k * 100).toFixed(0)}%)`;
  }
  
  function findNearestRAL(hex) {
    let closest = null;
    let minDistance = Infinity;
  
    for (const color of Object.values(ralColors)) {
        const distance = chroma.distance(hex, color.hex);
      if (distance < minDistance) {
        minDistance = distance;
        closest = color;
      }
    }
  
    return closest ? `${closest.ral} – ${closest.name}` : 'Unknown RAL';
  }
  
  function findNearestPantone(hex) {
    let closest = null;
    let minDistance = Infinity;
  
    for (const entry of Object.values(pantoneColors)) {
      const pantoneHex = entry.hex; // <== виправлено
      if (!pantoneHex) continue;
  
      const distance = chroma.distance(hex, pantoneHex);
      if (distance < minDistance) {
        minDistance = distance;
        closest = entry;
      }
    }
  
    return closest ? `${closest.name}` : 'Unknown Pantone';
  }
  
  

export default function Generator() {
  const [paletteType, setPaletteType] = useState('random');
  const [baseColor, setBaseColor] = useState('#3498db');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const [colors, setColors] = useState(
    Array.from({ length: 5 }, () => chroma(getRandomColor()).hsl())
  );
  
  const [savedPalettes, setSavedPalettes] = useState(() => {
    const stored = localStorage.getItem('palettes');
    return stored ? JSON.parse(stored) : [];
  });

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [colorFormat, setColorFormat] = useState('hex');

  const regenerate = () => {
    // формати, які не підтримують схеми
    const isFormatLimited = ['cmyk', 'ral', 'pantone'].includes(colorFormat);
  
    if (paletteType === 'random' || isFormatLimited) {
      setColors(Array.from({ length: 5 }, () => chroma(getRandomColor()).hsl()));
      
      if (isFormatLimited && paletteType !== 'random') {
        setNotice('No support for this format:( We work on it. The combination use Random method.');
      } else {
        setNotice('');
      }
  
    } else {
      const scheme = generateScheme(baseColor, paletteType);
      setColors(scheme.map(c => chroma(c).hsl()));
      setNotice('');
    }
  };
  
  
  

  const copyToClipboard = (color, index) => {
    navigator.clipboard.writeText(formatColor(color, colorFormat));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };  

  const savePalette = () => {
    const updated = [...savedPalettes, colors];
    setSavedPalettes(updated);
    localStorage.setItem('palettes', JSON.stringify(updated));
  };

  return (
    <div className="app">
      
      <h1>Dr🎨ps <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
    Go Back
</button>
</h1>
      <div style={{ marginBottom: '20px' }}>
  <label htmlFor="paletteType">Combination type: </label>
  <select
    id="paletteType"
    value={paletteType}
    onChange={(e) => setPaletteType(e.target.value)}
  >
    <option value="random">Random</option>
    <option value="analogous">Analog</option>
    <option value="complementary">Complementary</option>
    <option value="triad">Triad method</option>
    <option value="tetrad">Tetrad method</option>
  </select>
</div>
<div style={{ marginBottom: '20px' }}>
  <label htmlFor="format">Format of color: </label>
  <select
    id="format"
    value={colorFormat}
    onChange={(e) => setColorFormat(e.target.value)}
  >
    <option value="hex">HEX</option>
    <option value="rgb">RGB</option>
    <option value="hsl">HSL</option>
    <option value="cmyk">CMYK</option>
    <option value="ral">RAL</option>
    <option value="pantone">Pantone</option>
  </select>
</div>

      <div className="palette">
      {colors.map((hsl, index) => (
  <div key={index} className="color-wrapper">
    <div
      className="color-block"
      style={{ backgroundColor: chroma.hsl(...hsl).hex() }}
      onClick={() => copyToClipboard(chroma.hsl(...hsl), index)}
    >
      <span>
        {copiedIndex === index
          ? 'Copied!'
          : hslToColor(hsl, colorFormat)}
      </span>
    </div>

    {colorFormat === 'hsl' && (
  <div className="sliders">
    <input
      type="range"
      min="0"
      max="360"
      value={hsl[0]}
      onChange={(e) => {
        const newColors = [...colors];
        newColors[index][0] = parseFloat(e.target.value);
        setColors(newColors);
      }}
    />
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={hsl[1]}
      onChange={(e) => {
        const newColors = [...colors];
        newColors[index][1] = parseFloat(e.target.value);
        setColors(newColors);
      }}
    />
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={hsl[2]}
      onChange={(e) => {
        const newColors = [...colors];
        newColors[index][2] = parseFloat(e.target.value);
        setColors(newColors);
      }}
    />
  </div>
)}

  </div>
))}


      </div>

      <button onClick={regenerate}>Generate New Palette</button>
      <button onClick={savePalette} style={{ marginLeft: '10px' }}>Save Palette</button>
      {notice && (
  <div style={{ marginTop: '10px', color: 'orange', fontWeight: 'bold' }}>
    {notice}
  </div>
)}
      <h2>💾 Saved Palettes</h2>
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



