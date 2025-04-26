import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="app">
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>ColorDr🎨ps</h1>
      <Link to="/generator">
        <button style={{ marginRight: '10px' }}>Let`s generate</button>
      </Link>
      <Link to="/saved">
        <button>Your favorite gen</button>
      </Link>
    </div>
  );
}

