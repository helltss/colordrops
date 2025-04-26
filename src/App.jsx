import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Generator from './pages/Generator';
import Saved from './pages/Saved';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/saved" element={<Saved />} />
      </Routes>
    </Router>
  );
}

export default App;
