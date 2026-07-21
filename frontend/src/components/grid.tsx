function Grid() {
  const gridSize = 100;

  return (
    <div
      className="fixed h-screen w-screen overflow-hidden z-999 cursor-none pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    >
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-red-500/70" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-red-500/70" />
    </div>
  );
}

export default Grid;
