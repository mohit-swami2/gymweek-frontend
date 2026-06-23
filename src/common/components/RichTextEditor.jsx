import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Heading1, Heading2, Pilcrow,
  List, ListOrdered, Quote, Link2, Eraser, Code2,
} from 'lucide-react';
import './rich-text-editor.css';

/**
 * Dependency-free WYSIWYG HTML editor for CMS content (privacy, terms, email
 * bodies, etc.). Edits render as formatted content but the value is always a
 * plain HTML string, so it drops straight into the existing form state and the
 * live HtmlPreview. A "source" toggle lets power users edit raw HTML directly.
 */
export function RichTextEditor({ value = '', onChange, minHeight = 280, placeholder = 'Start writing…' }) {
  const editorRef = useRef(null);
  const [showSource, setShowSource] = useState(false);

  // Keep the contentEditable DOM in sync with external value changes (e.g. when
  // a different row is opened) without clobbering the caret during typing.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!showSource && value !== el.innerHTML) {
      el.innerHTML = value || '';
    }
  }, [value, showSource]);

  const emit = () => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange?.(html);
  };

  const exec = (command, arg) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const formatBlock = (tag) => exec('formatBlock', tag);

  const addLink = () => {
    const url = window.prompt('Link URL (include https://)', 'https://');
    if (url) exec('createLink', url);
  };

  const tools = [
    { icon: Bold, title: 'Bold', onClick: () => exec('bold') },
    { icon: Italic, title: 'Italic', onClick: () => exec('italic') },
    { icon: Underline, title: 'Underline', onClick: () => exec('underline') },
    { divider: true },
    { icon: Heading1, title: 'Heading 1', onClick: () => formatBlock('h1') },
    { icon: Heading2, title: 'Heading 2', onClick: () => formatBlock('h2') },
    { icon: Pilcrow, title: 'Paragraph', onClick: () => formatBlock('p') },
    { divider: true },
    { icon: List, title: 'Bullet list', onClick: () => exec('insertUnorderedList') },
    { icon: ListOrdered, title: 'Numbered list', onClick: () => exec('insertOrderedList') },
    { icon: Quote, title: 'Quote', onClick: () => formatBlock('blockquote') },
    { icon: Link2, title: 'Insert link', onClick: addLink },
    { divider: true },
    { icon: Eraser, title: 'Clear formatting', onClick: () => exec('removeFormat') },
  ];

  return (
    <div className="rte">
      <div className="rte__toolbar" onMouseDown={(e) => e.preventDefault()}>
        {tools.map((t, i) => (
          t.divider
            ? <span key={`d${i}`} className="rte__divider" aria-hidden="true" />
            : (
              <button
                key={t.title}
                type="button"
                className="rte__btn"
                title={t.title}
                aria-label={t.title}
                disabled={showSource}
                onClick={t.onClick}
              >
                <t.icon size={15} />
              </button>
            )
        ))}
        <span className="rte__spacer" />
        <button
          type="button"
          className={`rte__btn rte__btn--toggle${showSource ? ' rte__btn--active' : ''}`}
          title="Edit HTML source"
          aria-label="Edit HTML source"
          aria-pressed={showSource}
          onClick={() => setShowSource((s) => !s)}
        >
          <Code2 size={15} />
        </button>
      </div>

      {showSource ? (
        <textarea
          className="rte__source"
          style={{ minHeight }}
          value={value}
          spellCheck={false}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <div
          ref={editorRef}
          className="rte__editable"
          style={{ minHeight }}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          onInput={emit}
          onBlur={emit}
        />
      )}
    </div>
  );
}
