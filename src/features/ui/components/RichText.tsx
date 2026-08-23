import { Fragment, type ReactNode } from 'react'
import DOMPurify from 'isomorphic-dompurify'

// Старый контент набирался как обычный текст с самодельной разметкой —
// парсер ниже это по-прежнему понимает, чтобы не ломать то, что уже
// сохранено в базе:
//
//   ## Заголовок
//   Абзац с **важным** словом и примером `I have been waiting`.
//   - пункт списка
//   1. пункт нумерованного списка
//   > выноска: правило или частая ошибка
//
// Новый контент приходит из RichTextEditor (TipTap) как готовый HTML.
// Различаем форматы по наличию HTML-тега: если он есть — санитизируем и
// рендерим как разметку, иначе — как раньше, через самодельный парсер.

const HTML_TAG = /<[a-z][\s\S]*>/i

const ALLOWED_TAGS = [
  'p', 'h2', 'h3', 'strong', 'em', 'u', 's', 'a',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'span', 'mark'
]
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style']

function renderHtml(html: string, className?: string) {
  const safe = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
  return (
    <div
      className={className ? `rich ${className}` : 'rich'}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'callout'; text: string }

function parse(source: string): Block[] {
  const blocks: Block[] = []
  const lines = source.replace(/\r\n/g, '\n').split('\n')

  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }

  const flushList = () => {
    if (list) {
      blocks.push({ kind: 'list', ordered: list.ordered, items: list.items })
      list = null
    }
  }

  const flush = () => {
    flushParagraph()
    flushList()
  }

  for (const raw of lines) {
    const line = raw.trim()

    if (!line) {
      flush()
      continue
    }

    const heading = line.match(/^#{2,3}\s+(.*)$/)
    if (heading) {
      flush()
      blocks.push({ kind: 'heading', text: heading[1] })
      continue
    }

    const callout = line.match(/^>\s?(.*)$/)
    if (callout) {
      flush()
      blocks.push({ kind: 'callout', text: callout[1] })
      continue
    }

    const bullet = line.match(/^[-*•]\s+(.*)$/)
    if (bullet) {
      flushParagraph()
      if (!list || list.ordered) {
        flushList()
        list = { ordered: false, items: [] }
      }
      list.items.push(bullet[1])
      continue
    }

    const numbered = line.match(/^\d+[.)]\s+(.*)$/)
    if (numbered) {
      flushParagraph()
      if (!list || !list.ordered) {
        flushList()
        list = { ordered: true, items: [] }
      }
      list.items.push(numbered[1])
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flush()
  return blocks
}

// Жирный и моноширинный фрагменты. Разбор идёт одним проходом, чтобы
// `**a** и `b`` в одной строке не спорили друг с другом.
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const trimmed = (text || '').trim()
  if (!trimmed) return null

  if (HTML_TAG.test(trimmed)) {
    return renderHtml(trimmed, className)
  }

  const blocks = parse(trimmed)
  if (!blocks.length) return null

  return (
    <div className={className ? `rich ${className}` : 'rich'}>
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return <h3 key={index} className="rich__heading">{inline(block.text)}</h3>
        }

        if (block.kind === 'callout') {
          return <p key={index} className="rich__callout">{inline(block.text)}</p>
        }

        if (block.kind === 'list') {
          const items = block.items.map((item, i) => <li key={i}>{inline(item)}</li>)
          return block.ordered ? (
            <ol key={index} className="rich__list">{items}</ol>
          ) : (
            <ul key={index} className="rich__list">{items}</ul>
          )
        }

        return <p key={index} className="rich__paragraph">{inline(block.text)}</p>
      })}
    </div>
  )
}
