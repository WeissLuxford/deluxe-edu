export default function StructurePreview() {
  return (
    <section className="container structure-wrap" aria-labelledby="structure-head">
      <h2 id="structure-head" className="structure-head">Course structure preview</h2>

      <div className="structure-track">
        <article className="structure-item">
          <div className="struct-card">
            <div className="struct-title"><span className="accent">Week 1</span></div>
            <div className="struct-desc">Grammar and speaking practice</div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card struct-split">
            <div className="row">
              <div className="struct-title">Week 2</div>
              <div className="struct-desc">Listening and vocabulary</div>
            </div>
            <div className="row">
              <div className="struct-title">Week 3</div>
              <div className="struct-desc">Speaking club</div>
            </div>
          </div>
        </article>

        <article className="structure-item">
          <div className="struct-card struct-dim">
            <div className="struct-title">Lesson preview</div>
          </div>
        </article>
      </div>
    </section>
  )
}
