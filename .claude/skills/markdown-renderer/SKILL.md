# markdown-renderer 스킬

## 용도
react-markdown 기반 마크다운 뷰어 및 에디터 설정 패턴

---

## 패키지 목록

```json
{
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "rehype-highlight": "^7.x",
  "@uiw/react-md-editor": "^4.x"
}
```

---

## MarkdownViewer 컴포넌트

```tsx
// components/common/MarkdownViewer.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 코드 블록: JetBrains Mono 폰트
          code({ node, className, children, ...props }) {
            const isInline = !className
            if (isInline) {
              return <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded" {...props}>{children}</code>
            }
            return <code className={`font-mono ${className}`} {...props}>{children}</code>
          },
          // 외부 링크: 새 탭 열기
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            )
          },
          // 이미지: 최대 너비 제한
          img({ src, alt, ...props }) {
            return <img src={src} alt={alt} className="max-w-full rounded-md" {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

---

## MarkdownEditor 컴포넌트

`@uiw/react-md-editor`는 SSR 비호환이므로 **반드시 dynamic import** 사용.

```tsx
// components/common/MarkdownEditor.tsx
'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

// SSR 비호환 — dynamic import 필수
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then(mod => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export function MarkdownEditor({ value, onChange, placeholder, height = 300 }: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? '')}
        height={height}
        preview="live"
        textareaProps={{ placeholder }}
      />
    </div>
  )
}
```

---

## 앱 등록 폼 기본 템플릿

```typescript
// 앱 등록 폼 열 때 markdown_content 기본값
export const APP_MARKDOWN_TEMPLATE = `## 앱 소개
<!-- 이 앱이 무엇을 하는지 한두 문장으로 설명해 주세요 -->

## 주요 기능
-
-
-

## 사용 방법
1.
2.
3.

## 개발 배경
<!-- 왜 이 앱을 만들었는지 간단히 설명해 주세요 -->

## 참고 사항
<!-- API KEY 필요 여부, 사용 제한, 주의사항 등 -->
`
```

---

## SearchHighlight 컴포넌트

```tsx
// components/apps/SearchHighlight.tsx
interface SearchHighlightProps {
  text: string
  query: string
}

export function SearchHighlight({ text, query }: SearchHighlightProps) {
  if (!query.trim()) return <span>{text}</span>

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-primary/20 text-primary font-medium rounded-sm px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}
```

---

## prose 스타일 (Tailwind Typography)

```css
/* globals.css — prose 커스터마이징 */
.prose h2 { @apply text-xl font-semibold mt-6 mb-3; }
.prose h3 { @apply text-lg font-semibold mt-4 mb-2; }
.prose ul { @apply list-disc pl-5 space-y-1; }
.prose ol { @apply list-decimal pl-5 space-y-1; }
.prose blockquote { @apply border-l-4 border-primary/40 pl-4 italic text-muted-foreground; }
.prose code { font-family: 'JetBrains Mono', monospace; }
```
