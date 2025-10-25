import Link from "next/link"

export default function SiteFooter() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg)",
        color: "var(--fg)"
      }}
    >
      <div
        className="container py-10 grid gap-10 md:grid-cols-3"
        style={{ alignItems: "start" }}
      >
        <div className="space-y-2">
          <div className="text-xs text-muted uppercase tracking-wider">
            Chat with us
          </div>
          <div className="text-lg font-medium">
            <a href="mailto:hello@vertex.uz" className="hover:text-gold transition-colors">
              hello@vertex.uz
            </a>
          </div>
          <div className="text-lg font-medium">
            <a href="tel:+998901234567" className="hover:text-gold transition-colors">
              +998 90 123 45 67
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-muted uppercase tracking-wider">
            Follow us
          </div>
          <div className="flex items-center gap-4 text-2xl">
            <Link
              href="https://t.me/vertexedu"
              target="_blank"
              className="hover:text-gold transition-colors"
            >
              <i className="bi bi-telegram" />
            </Link>
            <Link
              href="https://instagram.com/vertexedu"
              target="_blank"
              className="hover:text-gold transition-colors"
            >
              <i className="bi bi-instagram" />
            </Link>
            <Link
              href="https://youtube.com/@vertexedu"
              target="_blank"
              className="hover:text-gold transition-colors"
            >
              <i className="bi bi-youtube" />
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-muted uppercase tracking-wider">
            Links
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms of Use
            </Link>
            <Link href="/contact" className="hover:text-gold transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div
        className="border-t text-sm text-muted py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l9 18H3z" fill="var(--gold)" />
            </svg>
            <span className="font-medium">Vertex</span>
          </div>
          <div>© {new Date().getFullYear()} Vertex Education. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
