import GameCanvas from "./components/GameCanvas/GameCanvas";

export default function App() {
  return (
    <div>
      <h1>Make-a-pong</h1>
      <GameCanvas />
      <div className="description">
        <p>
          Control with mouse / touch <br/>
          Life restored every few hits  <br/>
          Streak = bonus points! <br/>
          Harder modes = bigger rewards <br />
        </p>
      </div>
    </div>
  );
}
