export default function Loading() {
  return (
    <main className="page" aria-busy="true">
      <h1>Today's schedule</h1>
      <p className="sub" role="status">
        Loading today's schedule…
      </p>
      <div className="card skeleton" />
    </main>
  );
}
