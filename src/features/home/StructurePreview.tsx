export default function StructurePreview() {
  return (
    <section className="container structure-wrap py-20" aria-labelledby="structure-head">
      <div className="text-center mb-12">
        <h2 id="structure-head" className="structure-head text-3xl md:text-4xl font-extrabold text-gradient mb-3">
          Course structure preview
        </h2>
        <p className="text-muted text-lg">See how lessons are organized</p>
      </div>

      <div className="structure-track">
        <article className="structure-item">
          <div className="struct-card">
            <div className="struct-title">
              <span className="accent">📹 Video Lesson</span>
            </div>
            <div className="struct-desc">
              10-15 minute lessons covering grammar, vocabulary, and pronunciation
            </div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card struct-split">
            <div className="row">
              <div className="struct-title">📝 Notes & Materials</div>
              <div className="struct-desc">Downloadable PDFs and summaries</div>
            </div>
            <div className="row">
              <div className="struct-title">✅ Interactive Test</div>
              <div className="struct-desc">Check your understanding instantly</div>
            </div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card" style={{ background: 'linear-gradient(135deg, rgba(199,164,90,0.1), rgba(212,176,106,0.05))' }}>
            <div className="struct-title">🎯 Weekly Progress</div>
            <div className="struct-desc">
              Track your learning journey with detailed analytics and achievements
            </div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card struct-split">
            <div className="row">
              <div className="struct-title">💬 Speaking Club</div>
              <div className="struct-desc">Practice with other students</div>
            </div>
            <div className="row">
              <div className="struct-title">🎓 Mock Tests</div>
              <div className="struct-desc">IELTS/TOEFL preparation</div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}