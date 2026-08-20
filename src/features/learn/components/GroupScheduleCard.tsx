import { getTranslations } from 'next-intl/server'
import type { StudentGroup, StudentUpcomingEvent, StudentAttendanceRecord } from '@/features/learn/schedule'

const TYPE_KEYS: Record<string, string> = {
  LESSON: 'eventTypeLesson',
  MOCK_TEST: 'eventTypeMockTest',
  EXAM: 'eventTypeExam',
  SPEAKING_PRACTICE: 'eventTypeSpeaking',
  OTHER: 'eventTypeOther'
}

const STATUS_KEYS: Record<string, string> = {
  PRESENT: 'attendancePresent',
  ABSENT: 'attendanceAbsent',
  LATE: 'attendanceLate',
  EXCUSED: 'attendanceExcused'
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

export async function GroupScheduleCard({
  locale,
  groups,
  upcoming,
  attendance
}: {
  locale: string
  groups: StudentGroup[]
  upcoming: StudentUpcomingEvent[]
  attendance: StudentAttendanceRecord[]
}) {
  const t = await getTranslations({ locale, namespace: 'learn' })

  return (
    <section className="learn-section">
      <h2 className="learn-section__title">{t('myGroupTitle')}</h2>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        {groups.map(g => (
          <div key={g.groupId} style={{ marginBottom: '0.25rem' }}>
            <strong style={{ color: 'var(--fg)' }}>{g.groupName}</strong>
            {g.teacherName && (
              <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>
                {t('myGroupTeacher', { name: g.teacherName })}
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--fg)' }}>{t('upcomingEventsTitle')}</h3>
          {upcoming.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>{t('noUpcomingEvents')}</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(e => (
                <li key={e.id} className="flex items-center justify-between">
                  <span>
                    <strong style={{ color: 'var(--fg)' }}>{e.title || t(TYPE_KEYS[e.type])}</strong>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      {e.groupName} · {t(TYPE_KEYS[e.type])}
                    </div>
                  </span>
                  <time className="text-xs" style={{ color: 'var(--muted)' }}>
                    {dateFmt.format(e.startsAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--fg)' }}>{t('attendanceTitle')}</h3>
          {attendance.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>{t('noAttendance')}</p>
          ) : (
            <ul className="space-y-2">
              {attendance.map(a => (
                <li key={a.id} className="flex items-center justify-between">
                  <span>
                    <strong style={{ color: 'var(--fg)' }}>{a.title || t(TYPE_KEYS[a.type])}</strong>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{a.groupName}</div>
                  </span>
                  <span className="badge">{t(STATUS_KEYS[a.status])}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
