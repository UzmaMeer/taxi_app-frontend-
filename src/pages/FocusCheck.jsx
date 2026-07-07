import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FocusCheck.css'

const OPTIONAL_TYPE_POOL = ['slider', 'move', 'size', 'color', 'shape', 'math', 'reaction', 'count', 'text']
const TOTAL_ROUNDS = OPTIONAL_TYPE_POOL.length + 1 // + rotate
const SKIP_BUDGET = 4 // can skip at most 4 rounds -> must complete at least (TOTAL_ROUNDS - 4) total
const REQUIRED_COMPLETIONS = TOTAL_ROUNDS - SKIP_BUDGET

const MAX_COUNT = 12
const LABEL_MODE_CHANCE = 0.5
const OBJECT_TYPES = ['🔵', '⭐', '🍎', '🔶', '🔷', '🟢', '🟡', '🟣', '🍉', '🚗', '⚽', '🎯']
const ANIMALS = ['🐂', '🐱', '🐶', '🐮', '🦊', '🐻', '🐼', '🦁']
const ICON_COLORS = ['#4f7cff', '#7c5cff', '#2ecf7a', '#f5a524', '#ff5470', '#22c1c3']
const COLOR_PALETTE = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#a855f7']
const SHAPES = ['●', '■', '▲', '◆', '★', '⬡']
const WORD_LIST = ['FOCUS', 'ALERT', 'SAFE', 'READY', 'CHECK', 'DRIVE', 'CALM', 'WATCH', 'SIGNAL', 'BRAKE', 'AWARE', 'STEADY']
const MOVE_COLS = 4
const MOVE_ROWS = 3

export const FOCUS_CHECK_SESSION_KEY = 'driveiq_focus_check_done'

const STEP_GAMES = {
  rotate: {
    values: Array.from({ length: 12 }, (_, i) => i * 30),
    wrap: true,
    instructions: 'Use the arrows to rotate the icon until its direction matches the reference.',
    mismatchText: 'Direction does not match yet',
  },
  slider: {
    values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    wrap: false,
    instructions: 'Use the arrows to slide the marker until it aligns with the reference.',
    mismatchText: 'Not aligned yet',
  },
  size: {
    values: [28, 36, 44, 52, 60, 68, 76],
    wrap: false,
    instructions: 'Use the arrows to resize the icon until it matches the reference size.',
    mismatchText: 'Not the right size yet',
  },
  color: {
    values: [0, 1, 2, 3, 4, 5],
    wrap: true,
    instructions: 'Use the arrows to cycle the color until it matches the reference.',
    mismatchText: 'Color does not match yet',
  },
  shape: {
    values: [0, 1, 2, 3, 4, 5],
    wrap: true,
    instructions: 'Use the arrows to cycle the shape until it matches the reference.',
    mismatchText: 'Shape does not match yet',
  },
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomPosition(existing) {
  let attempts = 0
  while (attempts < 40) {
    attempts++
    const x = randInt(2, 82)
    const y = randInt(4, 72)
    const overlaps = existing.some(p => Math.abs(p.x - x) < 13 && Math.abs(p.y - y) < 20)
    if (!overlaps) return { x, y, rot: randInt(-15, 15) }
  }
  return { x: randInt(2, 82), y: randInt(4, 72), rot: randInt(-15, 15) }
}

function generatePositions(count) {
  const arr = []
  for (let i = 0; i < count; i++) arr.push(randomPosition(arr))
  return arr
}

function generateRoundConfig(type) {
  if (type === 'count') {
    const t = randInt(3, 9)
    let cur
    do { cur = randInt(1, 9) } while (cur === t)
    const e = OBJECT_TYPES[randInt(0, OBJECT_TYPES.length - 1)]
    const mode = Math.random() < LABEL_MODE_CHANCE ? 'label' : 'scatter'
    return {
      type,
      target: t,
      emoji: e,
      mode,
      targetPositions: mode === 'scatter' ? generatePositions(t) : [],
      answerPositions: generatePositions(cur),
    }
  }
  if (type === 'text') {
    const word = WORD_LIST[randInt(0, WORD_LIST.length - 1)]
    return {
      type,
      word,
      input: '',
      letterStyles: word.split('').map(() => ({
        rot: randInt(-18, 18),
        ty: randInt(-6, 6),
        color: ICON_COLORS[randInt(0, ICON_COLORS.length - 1)],
      })),
      noiseLines: Array.from({ length: 3 }, () => ({ top: randInt(15, 85), rot: randInt(-20, 20) })),
    }
  }
  if (type === 'math') {
    let op = Math.random() < 0.5 ? '+' : '-'
    let x = randInt(1, 9)
    let y = randInt(1, 9)
    if (op === '-' && y > x) { const tmp = x; x = y; y = tmp }
    const answer = op === '+' ? x + y : x - y
    let cur
    do { cur = randInt(0, 18) } while (cur === answer)
    return { type, a: x, b: y, op, answer, current: cur }
  }
  if (type === 'reaction') {
    return { type, phase: 'waiting', attempt: 0, goAt: 0 }
  }
  if (type === 'move') {
    const animal = ANIMALS[randInt(0, ANIMALS.length - 1)]
    const targetCol = randInt(0, MOVE_COLS - 1)
    const targetRow = randInt(0, MOVE_ROWS - 1)
    let currentCol
    let currentRow
    do {
      currentCol = randInt(0, MOVE_COLS - 1)
      currentRow = randInt(0, MOVE_ROWS - 1)
    } while (currentCol === targetCol && currentRow === targetRow)
    return { type, animal, targetCol, targetRow, currentCol, currentRow }
  }
  const cfg = STEP_GAMES[type]
  const len = cfg.values.length
  const tIdx = randInt(0, len - 1)
  let cIdx
  do { cIdx = randInt(0, len - 1) } while (cIdx === tIdx && len > 1)
  const extra = {}
  if (type === 'rotate' || type === 'shape') extra.color = ICON_COLORS[randInt(0, ICON_COLORS.length - 1)]
  if (type === 'size') extra.emoji = OBJECT_TYPES[randInt(0, OBJECT_TYPES.length - 1)]
  if (type === 'slider') extra.animal = ANIMALS[randInt(0, ANIMALS.length - 1)]
  return { type, targetIdx: tIdx, currentIdx: cIdx, ...extra }
}

function checkMatch(cfg) {
  if (cfg.type === 'count') return cfg.answerPositions.length === cfg.target
  if (cfg.type === 'text') return cfg.input.trim().toUpperCase() === cfg.word
  if (cfg.type === 'math') return cfg.current === cfg.answer
  if (cfg.type === 'reaction') return false
  if (cfg.type === 'move') return cfg.currentCol === cfg.targetCol && cfg.currentRow === cfg.targetRow
  return cfg.currentIdx === cfg.targetIdx
}

function mismatchTextFor(cfg) {
  if (cfg.type === 'count') return 'Not matching yet'
  if (cfg.type === 'text') return 'That does not match, try again'
  if (cfg.type === 'math') return 'Not the correct answer yet'
  if (cfg.type === 'move') return 'Not at the right spot yet'
  return STEP_GAMES[cfg.type].mismatchText
}

function instructionsFor(cfg) {
  if (cfg.type === 'count') return 'Use the arrows to change the number of objects until it matches the left side.'
  if (cfg.type === 'text') return 'Type the distorted word exactly as shown below.'
  if (cfg.type === 'math') return 'Use the arrows to adjust the number until it solves the equation.'
  if (cfg.type === 'reaction') return 'Wait for the box to turn green, then tap it as fast as you can.'
  if (cfg.type === 'move') return 'Use the arrows to move the animal to the same spot as the reference.'
  return STEP_GAMES[cfg.type].instructions
}

function movePositionStyle(col, row) {
  const left = MOVE_COLS > 1 ? 8 + col * (84 / (MOVE_COLS - 1)) : 50
  const top = MOVE_ROWS > 1 ? 14 + row * (64 / (MOVE_ROWS - 1)) : 50
  return { left: `${left}%`, top: `${top}%` }
}

function ArrowIcon({ angle, color, size = 76 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        transform: `rotate(${angle}deg)`,
        transition: 'transform 0.25s ease',
        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
      }}
    >
      <path d="M12 2L19 10H14.5V22H9.5V10H5L12 2Z" fill={color} />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function renderStepDisplay(cfg, idx) {
  const value = STEP_GAMES[cfg.type].values[idx]
  if (cfg.type === 'rotate') return <ArrowIcon angle={value} color={cfg.color} />
  if (cfg.type === 'slider') {
    return (
      <div className="slider-track">
        <div className="slider-marker" style={{ left: `${value}%` }}>{cfg.animal}</div>
      </div>
    )
  }
  if (cfg.type === 'size') return <span style={{ fontSize: value }}>{cfg.emoji}</span>
  if (cfg.type === 'color') return <div className="color-swatch" style={{ background: COLOR_PALETTE[value] }} />
  if (cfg.type === 'shape') return <span style={{ fontSize: 56, color: cfg.color }}>{SHAPES[value]}</span>
  return null
}

export default function FocusCheck() {
  const nav = useNavigate()
  const [screen, setScreen] = useState('start')
  const [round, setRound] = useState(1)
  const [roundTypes, setRoundTypes] = useState([])
  const [roundConfigs, setRoundConfigs] = useState([])
  const [completedSet, setCompletedSet] = useState(new Set())
  const [skippedSet, setSkippedSet] = useState(new Set())
  const [feedback, setFeedback] = useState(null)
  const [sessionStart, setSessionStart] = useState(0)
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0)

  const idx = round - 1
  const cfg = roundConfigs[idx]
  const isCompleted = completedSet.has(idx)
  const isSkipped = skippedSet.has(idx)
  const skipsLeft = SKIP_BUDGET - skippedSet.size
  const canFinish = completedSet.size >= REQUIRED_COMPLETIONS

  useEffect(() => {
    if (screen !== 'game') return
    const id = setInterval(() => setSessionElapsedMs(performance.now() - sessionStart), 200)
    return () => clearInterval(id)
  }, [screen, sessionStart])

  useEffect(() => {
    if (screen !== 'game' || !cfg || cfg.type !== 'reaction' || isCompleted || cfg.phase !== 'waiting') return
    const delay = randInt(1200, 3000)
    const id = setTimeout(() => {
      updateConfig(idx, { phase: 'go', goAt: performance.now() })
    }, delay)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, round, cfg?.type, cfg?.phase, cfg?.attempt, isCompleted])

  function updateConfig(i, patch) {
    setRoundConfigs(prev => prev.map((c, ci) => (ci === i ? { ...c, ...patch } : c)))
  }

  function startGame() {
    const types = ['rotate', ...shuffle(OPTIONAL_TYPE_POOL)]
    setRoundTypes(types)
    setRoundConfigs(types.map(generateRoundConfig))
    setCompletedSet(new Set())
    setSkippedSet(new Set())
    setSessionStart(performance.now())
    setSessionElapsedMs(0)
    setRound(1)
    setFeedback(null)
    setScreen('game')
  }

  function goTo(n) {
    setRound(Math.max(1, Math.min(TOTAL_ROUNDS, n)))
    setFeedback(null)
  }

  function adjustStep(direction) {
    const stepCfg = STEP_GAMES[cfg.type]
    const len = stepCfg.values.length
    let next = cfg.currentIdx + direction
    if (stepCfg.wrap) next = ((next % len) + len) % len
    else next = Math.max(0, Math.min(len - 1, next))
    updateConfig(idx, { currentIdx: next })
  }

  function adjustCount(delta) {
    let positions = cfg.answerPositions
    if (delta > 0) {
      if (positions.length >= MAX_COUNT) return
      positions = [...positions, randomPosition(positions)]
    } else {
      if (positions.length <= 0) return
      positions = positions.slice(0, -1)
    }
    updateConfig(idx, { answerPositions: positions })
  }

  function adjustMath(delta) {
    updateConfig(idx, { current: Math.max(0, Math.min(18, cfg.current + delta)) })
  }

  function adjustMove(dCol, dRow) {
    const nextCol = Math.max(0, Math.min(MOVE_COLS - 1, cfg.currentCol + dCol))
    const nextRow = Math.max(0, Math.min(MOVE_ROWS - 1, cfg.currentRow + dRow))
    updateConfig(idx, { currentCol: nextCol, currentRow: nextRow })
  }

  function markCompleted() {
    setCompletedSet(prev => new Set(prev).add(idx))
    setSkippedSet(prev => {
      if (!prev.has(idx)) return prev
      const next = new Set(prev)
      next.delete(idx)
      return next
    })
  }

  function handleSubmit() {
    if (checkMatch(cfg)) {
      setFeedback({ type: 'good', text: 'Correct' })
      markCompleted()
      setTimeout(() => {
        setRound(r => Math.min(TOTAL_ROUNDS, r + 1))
        setFeedback(null)
      }, 350)
    } else {
      setFeedback({ type: 'bad', text: mismatchTextFor(cfg) })
    }
  }

  function handleSkip() {
    if (skipsLeft <= 0) return
    setSkippedSet(prev => new Set(prev).add(idx))
    setRound(r => Math.min(TOTAL_ROUNDS, r + 1))
    setFeedback(null)
  }

  function handleReactionTap() {
    if (cfg.phase === 'waiting') {
      setFeedback({ type: 'bad', text: 'Too soon, wait for green' })
      updateConfig(idx, { attempt: (cfg.attempt || 0) + 1 })
    } else {
      const rt = performance.now() - cfg.goAt
      setFeedback({ type: 'good', text: `Nice, ${Math.round(rt)}ms` })
      markCompleted()
      setTimeout(() => {
        setRound(r => Math.min(TOTAL_ROUNDS, r + 1))
        setFeedback(null)
      }, 350)
    }
  }

  function continueTo(path) {
    try {
      sessionStorage.setItem(FOCUS_CHECK_SESSION_KEY, '1')
    } catch (e) {
      // ignore
    }
    nav(path)
  }

  if (screen === 'start') {
    return (
      <div className="focus-check-page">
        <div className="card">
          <span className="badge">Pre-Login Check</span>
          <h1>Driver Focus Check</h1>
          <p className="subtitle">
            Before you sign in, complete a short attention check. There are {TOTAL_ROUNDS} rounds —
            including two where you move an animal with the arrows, plus counting, size, shape, color,
            a math check, a distorted word, and a reaction test. Use Prev / Next or the dots below to
            browse all of them in any order. You can skip up to {SKIP_BUDGET}, but must complete at
            least {REQUIRED_COMPLETIONS} to finish.
          </p>
          <button className="primary-btn" onClick={startGame}>Start Check</button>
          <button className="link-btn" onClick={() => nav('/')}>← Back to home</button>
          <div className="disclaimer">
            This is a workplace attention/readiness check. It does not diagnose or assess mental health.
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'game' && cfg) {
    return (
      <div className="focus-check-page">
        <div className="card">
        <div className="round-row">
          <span className="round-text">Round {round} of {TOTAL_ROUNDS}</span>
          <span className="timer-text">{(sessionElapsedMs / 1000).toFixed(0)}s</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(completedSet.size / TOTAL_ROUNDS) * 100}%` }} />
        </div>

        <div className="dot-row">
          {roundTypes.map((t, i) => (
            <button
              key={i}
              className={`dot ${completedSet.has(i) ? 'done' : skippedSet.has(i) ? 'skip' : ''} ${i === idx ? 'active' : ''}`}
              onClick={() => goTo(i + 1)}
              aria-label={`Go to round ${i + 1}`}
            />
          ))}
        </div>

        <div className="instructions">{instructionsFor(cfg)}</div>

        {cfg.type === 'count' && (
          <div className="panels">
            <div className="panel">
              <div className="panel-title">Target</div>
              {cfg.mode === 'label' ? (
                <div className="spec-label">
                  <span className="spec-number">{cfg.target}</span>
                  <span className="spec-times">×</span>
                  <span className="spec-icon">{cfg.emoji}</span>
                </div>
              ) : (
                <div className="object-grid">
                  {cfg.targetPositions.map((p, i) => (
                    <span key={i} className="obj" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rot}deg)` }}>
                      {cfg.emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="panel">
              <div className="panel-title">Your Answer</div>
              <div className="object-grid">
                {cfg.answerPositions.map((p, i) => (
                  <span key={i} className="obj" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rot}deg)` }}>
                    {cfg.emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'text' && (
          <>
            <div className="captcha-box">
              {cfg.noiseLines.map((l, i) => (
                <div key={i} className="noise-line" style={{ top: `${l.top}%`, transform: `rotate(${l.rot}deg)` }} />
              ))}
              <div className="captcha-word">
                {cfg.word.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="captcha-letter"
                    style={{
                      transform: `rotate(${cfg.letterStyles[i]?.rot ?? 0}deg) translateY(${cfg.letterStyles[i]?.ty ?? 0}px)`,
                      color: cfg.letterStyles[i]?.color ?? '#eef1f6',
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
            {!isCompleted && (
              <input
                className="captcha-input"
                type="text"
                value={cfg.input}
                onChange={e => updateConfig(idx, { input: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="Type the word above"
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            )}
          </>
        )}

        {cfg.type === 'math' && (
          <div className="panels">
            <div className="panel">
              <div className="panel-title">Solve</div>
              <div className="spec-label">
                <span className="spec-number">{cfg.a}</span>
                <span className="spec-times">{cfg.op}</span>
                <span className="spec-number">{cfg.b}</span>
              </div>
            </div>
            <div className="panel">
              <div className="panel-title">Your Answer</div>
              <div className="spec-label">
                <span className="spec-number" style={{ fontSize: 56 }}>{cfg.current}</span>
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'reaction' && (
          <div className={`reaction-box ${cfg.phase}`} onClick={isCompleted ? undefined : handleReactionTap}>
            {isCompleted ? 'Completed' : cfg.phase === 'waiting' ? 'Wait for green…' : 'TAP NOW'}
          </div>
        )}

        {cfg.type === 'move' && (
          <div className="panels">
            <div className="panel">
              <div className="panel-title">Target</div>
              <div className="move-grid">
                <span className="move-token" style={movePositionStyle(cfg.targetCol, cfg.targetRow)}>{cfg.animal}</span>
              </div>
            </div>
            <div className="panel">
              <div className="panel-title">Your Answer</div>
              <div className="move-grid">
                <span className="move-token" style={movePositionStyle(cfg.currentCol, cfg.currentRow)}>{cfg.animal}</span>
              </div>
            </div>
          </div>
        )}

        {(cfg.type === 'rotate' || cfg.type === 'slider' || cfg.type === 'size' || cfg.type === 'color' || cfg.type === 'shape') && (
          <div className="panels">
            <div className="panel">
              <div className="panel-title">Target</div>
              <div className="arrow-icon-wrap">{renderStepDisplay(cfg, cfg.targetIdx)}</div>
            </div>
            <div className="panel">
              <div className="panel-title">Your Answer</div>
              <div className="arrow-icon-wrap">{renderStepDisplay(cfg, cfg.currentIdx)}</div>
            </div>
          </div>
        )}

        {!isCompleted && cfg.type === 'move' && (
          <div className="dpad">
            <button className="arrow-btn dpad-up" onClick={() => adjustMove(0, -1)} aria-label="Move up">▲</button>
            <button className="arrow-btn dpad-left" onClick={() => adjustMove(-1, 0)} aria-label="Move left">◀</button>
            <button className="arrow-btn dpad-right" onClick={() => adjustMove(1, 0)} aria-label="Move right">▶</button>
            <button className="arrow-btn dpad-down" onClick={() => adjustMove(0, 1)} aria-label="Move down">▼</button>
          </div>
        )}

        {!isCompleted && cfg.type !== 'text' && cfg.type !== 'reaction' && cfg.type !== 'move' && (
          <div className="counter-row">
            {cfg.type === 'count' && (
              <>
                <button className="arrow-btn" onClick={() => adjustCount(-1)} aria-label="Decrease count"><ChevronLeft /></button>
                <div className="count-display">{cfg.answerPositions.length}</div>
                <button className="arrow-btn" onClick={() => adjustCount(1)} aria-label="Increase count"><ChevronRight /></button>
              </>
            )}
            {cfg.type === 'rotate' && (
              <>
                <button className="arrow-btn rotate-btn" onClick={() => adjustStep(-1)} aria-label="Rotate left">↺</button>
                <button className="arrow-btn rotate-btn" onClick={() => adjustStep(1)} aria-label="Rotate right">↻</button>
              </>
            )}
            {(cfg.type === 'slider' || cfg.type === 'size' || cfg.type === 'color' || cfg.type === 'shape') && (
              <>
                <button className="arrow-btn" onClick={() => adjustStep(-1)} aria-label="Decrease"><ChevronLeft /></button>
                <button className="arrow-btn" onClick={() => adjustStep(1)} aria-label="Increase"><ChevronRight /></button>
              </>
            )}
            {cfg.type === 'math' && (
              <>
                <button className="arrow-btn" onClick={() => adjustMath(-1)} aria-label="Decrease"><ChevronLeft /></button>
                <button className="arrow-btn" onClick={() => adjustMath(1)} aria-label="Increase"><ChevronRight /></button>
              </>
            )}
          </div>
        )}

        {isCompleted ? (
          <div className="completed-note"><CheckIcon /> Round completed</div>
        ) : (
          <>
            {cfg.type !== 'reaction' && (
              <button className="primary-btn" onClick={handleSubmit}>Submit</button>
            )}
            {skipsLeft > 0 && !isSkipped && (
              <button className="skip-btn" onClick={handleSkip}>Skip this round ({skipsLeft} left)</button>
            )}
            {isSkipped && <div className="skipped-note">Skipped — you can still complete it above.</div>}
          </>
        )}

        <div className={`feedback ${feedback?.type ?? ''}`}>
          {feedback && (feedback.type === 'good' ? <CheckIcon /> : <XIcon />)}
          {feedback?.text}
        </div>

        <div className="nav-row">
          <button className="nav-btn" disabled={round <= 1} onClick={() => goTo(round - 1)}>← Prev</button>
          <button className="nav-btn" disabled={round >= TOTAL_ROUNDS} onClick={() => goTo(round + 1)}>Next →</button>
        </div>

        <button className="primary-btn finish-btn" onClick={() => continueTo('/signup')} disabled={!canFinish}>
          Finish Check ({completedSet.size}/{REQUIRED_COMPLETIONS} required)
        </button>
        </div>
      </div>
    )
  }

  return null
}
