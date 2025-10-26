import Link from "next/link"

export default function MentorIntro({ base }: { base: string }) {
  return (
    <section id="mentor" className="relative py-24">
      <div className="container">
        <div className="mentor-grid glass-panel">
          <div className="mentor-media">
            <div className="mentor-photo-wrap">
              <img src="/brand/mentor.jpg" alt="Mentor" className="mentor-photo" />
              <div className="mentor-glow" />
            </div>
          </div>
          <div className="mentor-content">
            <h2 className="text-4xl font-extrabold mb-4 text-gradient">Meet your mentor</h2>
            <p className="text-lg text-muted mb-6">Focused guidance, calm pace, real progress</p>
            <ul className="mentor-list">
              <li>One to one attention when you need it</li>
              <li>Structured path from day one</li>
              <li>Clear assignments with practical feedback</li>
            </ul>
            <div className="mt-8">
              <Link href={`${base}/signin`} className="iridescent vx">Book a trial</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
