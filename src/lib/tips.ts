export const HOLD_TIPS = [
  'Find a spot on the wall and stare it down. Not the clock. Not your arm. That spot.',
  "Zen mode. The stein doesn't care that you're stressed - so don't be.",
  "Soft knees, stone face. Locking either one just burns fuel you'll want later.",
  "Shoulder down, not shrugged. You're not trying to hide your neck in it.",
  'Breathe like a human, not an accordion. Holding your breath adds tension, not time.',
  "Plant your feet once and trust them. Chasing your balance costs you seconds.",
  'Feet shoulder-width apart, core engaged. That\'s your foundation - build the hold on top of it.',
  "Think about literally anything else. The stein gets heavier the more you think about it.",
  "No fear. Pretend this is easy. Let everyone else wonder how you're not sweating.",
  "You've got a resting stein face for a reason. Deploy it now.",
  "Act like you've done this a thousand times. The stein can't tell the difference.",
  'Confidence is free. Spend all of it.',
  "This is the easiest thing you'll do all day. Say it till it's true.",
  "Look bored. Boredom doesn't shake.",
  "Whatever they're doing on their side of the room, you're doing better.",
  "Pick a spot straight ahead of you, lock in, and let your arm do the boring work.",
  "When you think you're done, yell. Yodel if you've got it in you.",
]

export function randomTip(): string {
  return HOLD_TIPS[Math.floor(Math.random() * HOLD_TIPS.length)]
}
