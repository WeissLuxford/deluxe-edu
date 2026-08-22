'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Mic, Square, CheckCircle2, Users } from 'lucide-react'

type LocalizedText = string | Record<string, string>
type Character = { id: string; name: LocalizedText }
type Line = { id: string; characterId: string; text: LocalizedText; audioUrl: string }
type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED'

type Props = {
  dialogueId: string
  title: string
  characters: Character[]
  lines: Line[]
  initialAttemptId: string | null
  initialCharacterId: string | null
  initialStatus: AttemptStatus | null
  initialRecordings: Record<string, string>
  locale: string
  onComplete: () => void
  isCompleted: boolean
}

function getLocalizedText(value: LocalizedText | undefined, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value[locale]) return value[locale]
  const first = Object.values(value)[0]
  return typeof first === 'string' ? first : ''
}

const MIME_CANDIDATES = ['audio/webm', 'audio/mp4', 'audio/ogg']

function pickMimeType(): string {
  if (typeof window === 'undefined' || !('MediaRecorder' in window)) return ''
  for (const type of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export function DialogueStep({
  dialogueId,
  title,
  characters,
  lines,
  initialAttemptId,
  initialCharacterId,
  initialStatus,
  initialRecordings,
  locale,
  onComplete,
  isCompleted
}: Props) {
  const t = useTranslations('dialogue')
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [attemptId, setAttemptId] = useState(initialAttemptId)
  const [characterId, setCharacterId] = useState(initialCharacterId)
  const [recordings, setRecordings] = useState<Record<string, string>>(initialRecordings)
  const [phase, setPhase] = useState<'choose' | 'listen' | 'practice'>(
    isCompleted || initialStatus === 'COMPLETED' || initialCharacterId ? 'practice' : 'choose'
  )
  const [listenIndex, setListenIndex] = useState(0)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charName = (id: string) => getLocalizedText(characters.find(c => c.id === id)?.name, locale)

  const chooseCharacter = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/dialogues/${dialogueId}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: id })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || t('micError'))
        return
      }
      setAttemptId(data.attemptId)
      setCharacterId(data.characterId)
      setPhase('listen')
      setListenIndex(0)
    } catch {
      setError(t('micError'))
    } finally {
      setBusy(false)
    }
  }

  const listenLine = phase === 'listen' ? lines[listenIndex] : null

  useEffect(() => {
    if (!listenLine) return
    const el = audioRef.current
    if (!el) return
    el.src = listenLine.audioUrl
    el.play().catch(() => {})
  }, [listenLine])

  const onListenEnded = () => {
    if (listenIndex < lines.length - 1) setListenIndex(i => i + 1)
  }

  const replayListen = () => {
    setListenIndex(0)
    setPhase('listen')
  }

  const startPractice = () => {
    setPhase('practice')
    setPracticeIndex(0)
  }

  const currentLine = phase === 'practice' ? lines[practiceIndex] : null
  const isOwnLine = Boolean(currentLine && currentLine.characterId === characterId)

  useEffect(() => {
    if (!currentLine || isOwnLine) return
    const el = audioRef.current
    if (!el) return
    el.src = currentLine.audioUrl
    el.play().catch(() => {})
  }, [currentLine, isOwnLine])

  const advancePractice = async () => {
    if (practiceIndex < lines.length - 1) {
      setPracticeIndex(i => i + 1)
      return
    }
    if (!attemptId) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/dialogues/attempts/${attemptId}/complete`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || t('uploadError'))
        return
      }
      onComplete()
    } catch {
      setError(t('uploadError'))
    } finally {
      setBusy(false)
    }
  }

  const onPracticeEnded = () => {
    if (!isOwnLine) advancePractice()
  }

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch {
      setError(t('micError'))
    }
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach(tr => tr.stop())
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      await uploadRecording(blob)
    }
    recorder.stop()
    setRecording(false)
  }

  const uploadRecording = async (blob: Blob) => {
    if (!attemptId || !currentLine) return
    setBusy(true)
    setError(null)
    try {
      const ext = (blob.type.split('/')[1] || 'webm').split(';')[0]
      const form = new FormData()
      form.set('audio', blob, `line.${ext}`)
      const res = await fetch(`/api/dialogues/attempts/${attemptId}/lines/${currentLine.id}`, {
        method: 'POST',
        body: form
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || t('uploadError'))
        return
      }
      setRecordings(prev => ({ ...prev, [currentLine.id]: data.url }))
    } catch {
      setError(t('uploadError'))
    } finally {
      setBusy(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="test-result passed">
        <span className="test-result__icon">
          <CheckCircle2 size={40} />
        </span>
        <h2 className="test-result__title">{title}</h2>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <audio
        ref={audioRef}
        hidden
        onEnded={phase === 'listen' ? onListenEnded : onPracticeEnded}
      />

      {error && <div className="alert alert-error">{error}</div>}

      {phase === 'choose' && (
        <div className="space-y-3">
          <div className="test-question">
            <h3 className="test-question__title">{title}</h3>
            <p>{t('chooseCharacter')}</p>
          </div>
          <div className="test-options">
            {characters.map(c => (
              <button
                key={c.id}
                type="button"
                className="test-option"
                disabled={busy}
                onClick={() => chooseCharacter(c.id)}
              >
                <Users size={15} />
                {getLocalizedText(c.name, locale)}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'listen' && listenLine && (
        <div className="space-y-3">
          <p className="hint">{t('listenPhase')}</p>
          <div className="test-question">
            <span className="lesson-card__number">{charName(listenLine.characterId)}</span>
            <h3 className="test-question__title">{getLocalizedText(listenLine.text, locale)}</h3>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${((listenIndex + 1) / lines.length) * 100}%` }} />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => audioRef.current?.play().catch(() => {})}
          >
            <Play size={14} /> {t('play')}
          </button>

          {listenIndex === lines.length - 1 && (
            <div className="test-actions">
              <button type="button" className="btn btn-secondary" onClick={replayListen}>
                <Play size={16} /> {t('listenAgain')}
              </button>
              <button type="button" className="btn btn-primary" onClick={startPractice}>
                {t('startPractice')}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'practice' && currentLine && (
        <div className="space-y-3">
          <p className="hint">{t('practicePhase')}</p>
          <div className="test-question">
            <span className="lesson-card__number">
              {isOwnLine ? t('yourLine') : charName(currentLine.characterId)}
            </span>
            <h3 className="test-question__title">{getLocalizedText(currentLine.text, locale)}</h3>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${((practiceIndex + 1) / lines.length) * 100}%` }} />
          </div>

          {!isOwnLine && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => audioRef.current?.play().catch(() => {})}
            >
              <Play size={14} /> {t('play')}
            </button>
          )}

          {isOwnLine && (
            <div className="test-actions">
              {!recording ? (
                <button type="button" className="btn btn-primary" onClick={startRecording} disabled={busy}>
                  <Mic size={16} /> {recordings[currentLine.id] ? t('reRecord') : t('record')}
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={stopRecording}>
                  <Square size={16} /> {t('stopRecording')}
                </button>
              )}

              {recordings[currentLine.id] && !recording && (
                <>
                  <audio src={recordings[currentLine.id]} controls />
                  <button type="button" className="btn btn-primary" onClick={advancePractice} disabled={busy}>
                    {practiceIndex < lines.length - 1 ? t('next') : t('finish')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
