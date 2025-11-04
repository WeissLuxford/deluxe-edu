import Link from "next/link"

export default function MentorIntro({ base }: { base: string }) {
  return (
    <section id="mentor" className="relative py-24" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="mentor-grid glass-panel">
          <div className="mentor-media">
            <div className="mentor-photo-wrap">
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '8rem',
                  fontWeight: '800',
                  color: 'var(--bg)',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                T
              </div>
              <div className="mentor-glow" />
            </div>
          </div>
          <div className="mentor-content">
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>IELTS 8.0 Certified</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 text-gradient">Meet your mentor</h2>
            <p className="text-lg text-muted mb-6">
              Learn from an experienced teacher who actually cares about your progress. No arrogance, just results.
            </p>
            <ul className="mentor-list">
              <li>One-on-one attention when you need it</li>
              <li>Structured learning path from beginner to advanced</li>
              <li>Clear feedback on speaking, writing, and grammar</li>
              <li>Live Q&A sessions every week</li>
              <li>Personalized study recommendations</li>
            </ul>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link href={`${base}/courses`} className="iridescent vx">View Courses</Link>
              <Link href={`${base}/contacts`} className="btn-secondary">Contact Mentor</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}