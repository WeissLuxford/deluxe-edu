/* /features/ui/Footer.tsx */
import Link from "next/link"
import { VertexLogo } from './VertexLogo_v2'

export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="vx-footer">
      <div className="vx-footer__container container">
        <div className="vx-footer__line" />
        <div className="vx-footer__top grid gap-8 md:grid-cols-12 pt-6">

          <div className="vx-footer__brand ">
            <div className="vx-footer__logo">
              <VertexLogo className="vx-footer__logoImg h-[6rem] md:h-[9rem] lg:h-[11rem] w-auto" />
            </div>
            <div className="vx-footer__tagline">Learning. Elevated.</div>
          </div>

          <nav className="vx-footer__nav ">
            <Link href="/courses" className="vx-link vx-bracket">Courses</Link>
            <Link href="/about" className="vx-link vx-bracket">About</Link>
            <Link href="/services" className="vx-link vx-bracket">Services</Link>
            <Link href="/contact" className="vx-link vx-bracket">Contact</Link>
          </nav>

          <nav className="vx-footer__social ">
            <Link href="https://instagram.com/vertexedu" target="_blank" className="vx-link vx-bracket">Instagram</Link>
            <Link href="https://linkedin.com/company/vertexedu" target="_blank" className="vx-link vx-bracket">YouTube</Link>
            <Link href="https://bsky.app/profile/vertexedu" target="_blank" className="vx-link vx-bracket">FaceBook</Link>
            <Link href="https://t.me/vertexedu" target="_blank" className="vx-link vx-bracket">Telegram</Link>
          </nav>

          <div className="vx-footer__contacts ">
            <div className="vx-contactRow">
              <div className="vx-contactKey">A</div>
              <div className="vx-contactVal">Vertex, Tashkent, UZ</div>
            </div>
            <div className="vx-contactRow">
              <div className="vx-contactKey">P</div>
              <div className="vx-contactVal"><a href="tel:+998901234567" className="vx-link">+998 90 123 45 67</a></div>
            </div>
            <div className="vx-contactRow">
              <div className="vx-contactKey">E</div>
              <div className="vx-contactVal"><a href="mailto:hello@vertex.uz" className="vx-link underline">hello@vertex.uz</a></div>
            </div>
          </div>

          <div className="vx-footer__meta ">
            <div className="vx-footer__line" />
            <div className="vx-metaRow">
              <div className="vx-legal">
                <Link href="/fr" className="vx-link-quiet">ForReal</Link>
                <Link href="/privacy" className="vx-link-quiet">Privacy Policy</Link>
                <Link href="/terms" className="vx-link-quiet">Terms and Conditions</Link>
              </div>
              <div className="vx-badges">
                <span className="vx-badge">Be Fine</span>
                <span className="vx-badge">Dont worry</span>
              </div>
            </div>
          </div>
        </div>

        <div className="vx-footer__line mt-8" />
        <div className="vx-bar">
          <div className="vx-barLeft">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 18H3z" fill="var(--gold)" /></svg>
            <span className="vx-brandName">Vertex</span>
          </div>
          <div className="vx-copy">© {year} Vertex Education</div>
        </div>
      </div>
    </footer>
  )
}
