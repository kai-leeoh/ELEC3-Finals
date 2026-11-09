// Full-screen "Pau Cutz" splash with a spinning barber pole.
export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-pole" aria-hidden="true" />
      <div className="loading-title">Pau Cutz</div>
      <div className="loading-sub">Barber shop</div>
      <p className="loading-text">
        Loading
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>
    </div>
  );
}
