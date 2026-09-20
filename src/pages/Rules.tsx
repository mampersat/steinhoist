export function Rules() {
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-bold text-stein-amber-bright">Form &amp; rules</h1>
      <p className="mb-8 text-stein-cream/70">
        A quick reference for legal competition form. Hold to this standard in practice too - it's the only way a
        training time means anything on competition day.
      </p>

      <RuleItem
        title="Arm straight and level"
        body="Extend one arm fully in front of you, parallel to the floor, at or near shoulder height. The elbow stays locked - any bend ends the attempt."
      />
      <RuleItem
        title="One hand, one arm, the whole time"
        body="Grip the handle with a single hand. Switching hands or arms mid-hold isn't allowed."
      />
      <RuleItem
        title="No bracing"
        body="The stein's weight is carried by your shoulder and arm alone. Resting your arm against your body, a wall, or anything else disqualifies the hold."
      />
      <RuleItem
        title="Keep it upright"
        body="Tipping the stein far enough to spill ends the hold, even if your arm hasn't dropped. Grip and wrist control matter as much as raw shoulder endurance."
      />
      <RuleItem
        title="Failure is immediate"
        body="A hold ends the instant the arm drops noticeably below level, the elbow bends, the stein spills, or you touch anything for support - there's no recovering mid-attempt."
      />

      <p className="mt-8 text-sm text-stein-cream/60">
        This is a training reference, not an official rulebook - always defer to your event's judges and published
        rules.
      </p>
    </div>
  )
}

function RuleItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="mb-6 border-b border-stein-amber/15 pb-6 last:mb-0 last:border-0 last:pb-0">
      <div className="mb-1 text-base font-semibold text-stein-amber-bright">{title}</div>
      <p className="text-sm text-stein-cream/70">{body}</p>
    </div>
  )
}
