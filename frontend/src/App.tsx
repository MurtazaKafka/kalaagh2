import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n/config'; // Initialize i18n
import VintageApp from './VintageApp';
import { TestConnection } from './pages/TestConnection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VintageApp />} />
        <Route path="/test-connection" element={<TestConnection />} />
      </Routes>
    </Router>
  );
}

export default App;