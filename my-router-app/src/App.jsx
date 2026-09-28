import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Counter from './components/Counter.jsx';
import DefaultContact from './components/DefaultContact.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Home from './components/Home.jsx';

function App() {
  const name = "Jerry";
  const city = "NYC";
  return (
    <Container>
      <Router>
        <h1>Router Demo</h1>          {/* ← Added heading */}
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to={`/about/${name}`}>About</Link></li>
          <li><Link to="/counter">Counter</Link></li>
          <li><Link to={`/contact/${name}/${city}`}>Contact</Link></li>
        </ul>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about/:name" element={<About />} />
          <Route path="/contact" element={<DefaultContact />} />
          <Route path="/contact/:name/:city" element={<Contact />} />
          <Route path="/counter" element={<Counter />} />
          <Route path="*" element={<h3>404: Page not found</h3>} />
        </Routes>
      </Router>
    </Container>
  );
}

export default App;