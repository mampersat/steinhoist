import type { Settings } from '../types'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  audioCtx ??= new Ctor()
  return audioCtx
}

function beep(frequency: number, durationMs: number): void {
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = frequency
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + durationMs / 1000)
}

function speak(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.05
  window.speechSynthesis.speak(utterance)
}

export function cueRaiseStein(settings: Settings): void {
  if (settings.audioCuesEnabled) beep(880, 250)
  if (settings.voiceCuesEnabled) speak('Raise!')
}

export function cueRestStarted(settings: Settings): void {
  if (settings.audioCuesEnabled) beep(440, 200)
  if (settings.voiceCuesEnabled) speak('Rest.')
}

export function cueWorkoutComplete(settings: Settings): void {
  if (settings.audioCuesEnabled) {
    beep(660, 150)
    setTimeout(() => beep(880, 250), 180)
  }
  if (settings.voiceCuesEnabled) speak('Workout complete!')
}

export function cueCountdownTick(settings: Settings, n: number): void {
  if (settings.audioCuesEnabled) beep(500, 120)
  if (settings.voiceCuesEnabled) speak(n === 0 ? 'Go!' : String(n))
}
