export function About() {
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-bold text-stein-amber-bright">About</h1>
      <p className="mb-8 text-lg text-stein-cream/90">Get better at Steinholding with a plan, not just a stopwatch.</p>

      <div className="mb-6 border-b border-stein-amber/15 pb-6">
        <div className="mb-1 text-base font-semibold text-stein-amber-bright">Your data</div>
        <p className="text-sm text-stein-cream/70">
          Stays on this device. No account, no server, nothing shared.
        </p>
      </div>

      <p className="text-sm text-stein-cream/60">
        Not affiliated with the U.S. Steinholding Association or any competition organizer. Always defer to your
        event's official rules and judges.
      </p>
    </div>
  )
}
