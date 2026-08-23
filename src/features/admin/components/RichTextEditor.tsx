'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TiptapLink from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  RectangleHorizontal,
  Undo,
  Redo,
  Code2,
  Palette,
  Code,
  Highlighter
} from 'lucide-react'

// Расширяем стандартную ссылку своим атрибутом class: без этого TipTap
// парсит <a> обратно в Link mark, но отбрасывает class, и вставленная
// «кнопка» после перезагрузки страницы превращалась бы обратно в обычную
// ссылку.
const Link = TiptapLink.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('class'),
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.class ? { class: attributes.class as string } : {}
      }
    }
  }
})

const COLORS = ['#dc2626', '#d97706', '#16a34a', '#2563eb', '#7c3aed', '#111827']

function Toolbar({ editor }: { editor: Editor }) {
  const [showColors, setShowColors] = useState(false)

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Ссылка (https://...)', previous || 'https://')
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const insertButton = () => {
    const label = window.prompt('Текст на кнопке', 'Подробнее')
    if (!label || !label.trim()) return
    const url = window.prompt('Куда ведёт кнопка (https://...)', 'https://')
    if (!url || !url.trim()) return

    editor
      .chain()
      .focus()
      .insertContent(
        `<p><a href="${url.trim()}" class="rte-btn" target="_blank" rel="noopener noreferrer">${label.trim()}</a></p>`
      )
      .run()
  }

  const cls = (active: boolean) => `rte-toolbar__btn${active ? ' active' : ''}`

  return (
    <div className="rte-toolbar">
      <button type="button" className={cls(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title="Жирный">
        <Bold size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Курсив">
        <Italic size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Подчёркнутый">
        <UnderlineIcon size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Зачёркнутый">
        <Strikethrough size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('highlight'))} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Маркер (выделение)">
        <Highlighter size={15} />
      </button>

      <span className="rte-toolbar__sep" />

      <button type="button" className={cls(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Заголовок">
        <Heading2 size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Подзаголовок">
        <Heading3 size={15} />
      </button>

      <span className="rte-toolbar__sep" />

      <button type="button" className={cls(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Маркированный список">
        <List size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Нумерованный список">
        <ListOrdered size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Выноска (callout)">
        <Quote size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()} title="Код (инлайн)">
        <Code2 size={15} />
      </button>
      <button type="button" className={cls(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Блок кода">
        <Code size={15} />
      </button>

      <span className="rte-toolbar__sep" />

      <div className="rte-toolbar__colorwrap">
        <button type="button" className="rte-toolbar__btn" onClick={() => setShowColors(v => !v)} title="Цвет текста">
          <Palette size={15} />
        </button>
        {showColors && (
          <div className="rte-toolbar__colors">
            <button
              type="button"
              className="rte-toolbar__swatch rte-toolbar__swatch--none"
              onClick={() => {
                editor.chain().focus().unsetColor().run()
                setShowColors(false)
              }}
              title="Убрать цвет"
            />
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className="rte-toolbar__swatch"
                style={{ background: c }}
                onClick={() => {
                  editor.chain().focus().setColor(c).run()
                  setShowColors(false)
                }}
                title={c}
              />
            ))}
          </div>
        )}
      </div>

      <button type="button" className={cls(editor.isActive('link'))} onClick={setLink} title="Ссылка">
        <LinkIcon size={15} />
      </button>
      <button type="button" className="rte-toolbar__btn" onClick={insertButton} title="Вставить кнопку-ссылку">
        <RectangleHorizontal size={15} />
      </button>

      <span className="rte-toolbar__sep" />

      <button type="button" className="rte-toolbar__btn" onClick={() => editor.chain().focus().undo().run()} title="Отменить">
        <Undo size={15} />
      </button>
      <button type="button" className="rte-toolbar__btn" onClick={() => editor.chain().focus().redo().run()} title="Повторить">
        <Redo size={15} />
      </button>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const [htmlMode, setHtmlMode] = useState(false)
  const [htmlDraft, setHtmlDraft] = useState(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextStyle,
      Color,
      Underline,
      Highlight,
      Link.configure({ openOnClick: false, autolink: false }),
      Placeholder.configure({ placeholder: placeholder ?? '' })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
    setHtmlDraft(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) return null

  const toggleHtmlMode = () => {
    if (htmlMode) {
      editor.commands.setContent(htmlDraft)
      onChange(editor.getHTML())
    } else {
      setHtmlDraft(editor.getHTML())
    }
    setHtmlMode(v => !v)
  }

  return (
    <div className="rte">
      <div className="rte-head">
        <Toolbar editor={editor} />
        <button type="button" className={`rte-toolbar__btn rte-toolbar__html${htmlMode ? ' active' : ''}`} onClick={toggleHtmlMode} title="Редактировать как HTML">
          HTML
        </button>
      </div>

      {htmlMode ? (
        <textarea
          className="rte-html"
          value={htmlDraft}
          onChange={e => setHtmlDraft(e.target.value)}
          rows={12}
        />
      ) : (
        <EditorContent editor={editor} className="rte-content" />
      )}
    </div>
  )
}
