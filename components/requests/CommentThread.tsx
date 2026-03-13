'use client'

import { useState, useCallback } from 'react'
import { MessageSquare, CornerDownRight } from 'lucide-react'
import { CommentForm } from './CommentForm'
import type { CommentNode } from '@/output/step2_types'

interface CommentNodeProps {
  node: CommentNode
  postId: string
  onRefresh: () => void
}

function CommentItem({ node, postId, onRefresh }: CommentNodeProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const canReply = node.depth < 2

  return (
    <div className="group">
      {/* 댓글 본문 */}
      <div className="flex gap-2">
        <div className="flex flex-col items-center">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              {node.author_nickname.slice(0, 1).toUpperCase()}
            </span>
          </div>
          {node.children.length > 0 && (
            <div className="w-px flex-1 bg-border mt-1" />
          )}
        </div>
        <div className="flex-1 min-w-0 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{node.author_nickname}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(node.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {node.content}
          </p>
          {canReply && (
            <button
              onClick={() => setShowReplyForm((prev) => !prev)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              {showReplyForm ? '취소' : '답글'}
            </button>
          )}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={node.id}
                depth={node.depth + 1}
                placeholder={`@${node.author_nickname}에게 답글 달기`}
                onSuccess={() => {
                  setShowReplyForm(false)
                  onRefresh()
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 대댓글 */}
      {node.children.length > 0 && (
        <div className="ml-9 space-y-0 border-l border-border pl-4">
          {node.children.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              postId={postId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentThreadProps {
  postId: string
  initialComments: CommentNode[]
}

export function CommentThread({ postId, initialComments }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentNode[]>(initialComments)
  const [loading, setLoading] = useState(false)

  const refreshComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?post_id=${postId}`)
      if (res.ok) {
        const json = await res.json()
        setComments(json.data ?? [])
      }
    } catch {
      // 새로고침 실패 무시
    } finally {
      setLoading(false)
    }
  }, [postId])

  const totalCount = countComments(comments)

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <CornerDownRight className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">
          댓글 {totalCount}개
        </h2>
        {loading && (
          <span className="text-xs text-muted-foreground animate-pulse">업데이트 중...</span>
        )}
      </div>

      {/* 새 댓글 폼 */}
      <div className="mb-8">
        <CommentForm
          postId={postId}
          onSuccess={refreshComments}
        />
      </div>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((node) => (
            <CommentItem
              key={node.id}
              node={node}
              postId={postId}
              onRefresh={refreshComments}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function countComments(nodes: CommentNode[]): number {
  return nodes.reduce((acc, node) => acc + 1 + countComments(node.children), 0)
}
