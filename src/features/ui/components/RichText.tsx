import { Fragment, type ReactNode } from 'react'

// Конспекты вводятся в админке обычным текстом, поэтому разметка здесь
// намеренно скудная: заголовок, список, выноска, жирный и моноширинный
// фрагмент. Ничего, что нельзя набрать в textarea, не поддерживается.
//
//   ## Заголовок
//   Абзац с **важным** словом и примером `I have been waiting`.
//   - пункт списка
//   1. пункт нумерованного списка
//   > выноска: правило или частая ошибка

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
  const blocks = parse(text || '')
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
