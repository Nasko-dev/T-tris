import "./App.css";
import Tetris from "./components/Tetris";
import "./style.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TETRIS FUTURIST</h1>
        <p>Vivez le défi ultime de Tetris dans un monde futuriste.</p>
      </header>
      <main className="app-main">
        <Tetris />
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 Tetris Futurist. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default App;
