import GameCanvas from "./components/GameCanvas/GameCanvas";

export default function App() {
  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1 style={{ color: "white" }}>Ping Pong</h1>
      <GameCanvas />
    </div>
  );
}
