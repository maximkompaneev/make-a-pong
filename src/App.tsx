import GameCanvas from "./components/GameCanvas/GameCanvas";

export default function App() {
  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1 style={{ color: "white" }}>Make-a-pong</h1>
      <div className="description">
        <p style={{ color: "white", fontSize: "16px" }}>
          Use the left paddle (w/s) to play against the right paddle (↑/↓).
        </p>
      </div>
      <GameCanvas />
    </div>
  );
}
