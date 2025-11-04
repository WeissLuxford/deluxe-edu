// src/features/courses/components/lesson-steps/ConspectStep.tsx
'use client'

type Props = {
  content: string
  locale: string
}

export function ConspectStep({ content, locale }: Props) {
  return (
    <div className="space-y-6">
      {/* Conspect Header */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
          📝 Lesson Notes
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          Review the key points from this lesson
        </p>
      </div>

      {/* Conspect Content */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="prose prose-invert max-w-none" style={{ color: 'var(--fg)' }}>
          {/* Mock content - replace with real lesson.content */}
          <h3 style={{ color: 'var(--gold)' }}>Key Concepts</h3>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            {content || 'Lesson conspect will be displayed here. This can include formatted text, lists, examples, and important notes from the video.'}
          </p>

          <h3 style={{ color: 'var(--gold)', marginTop: '2rem' }}>Important Points</h3>
          <ul style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            <li>Point 1: Key concept explanation</li>
            <li>Point 2: Important rule or pattern</li>
            <li>Point 3: Common mistake to avoid</li>
          </ul>

          <h3 style={{ color: 'var(--gold)', marginTop: '2rem' }}>Examples</h3>
          <div className="rounded-lg p-4 mt-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <code style={{ color: 'var(--fg)', fontSize: '0.875rem' }}>
              Example sentences or code will appear here
            </code>
          </div>

          <h3 style={{ color: 'var(--gold)', marginTop: '2rem' }}>Summary</h3>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
            Quick recap of what you learned in this lesson. Make sure you understand these concepts before proceeding to the test.
          </p>
        </div>
      </div>

      {/* Next Step Info */}
      <div className="rounded-lg p-4" style={{ background: 'rgba(199, 164, 90, 0.1)', border: '1px solid var(--border)' }}>
        <div className="text-sm" style={{ color: 'var(--muted)' }}>
          💡 <strong style={{ color: 'var(--gold)' }}>Ready?</strong> Click "Next" when you've reviewed all the notes to proceed to the test.
        </div>
      </div>
    </div>
  )
}