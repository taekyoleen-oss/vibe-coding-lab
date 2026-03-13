'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MAX_ATTEMPTS = 3
const COOLDOWN_SECONDS = 60

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(0)

  // 쿨다운 타이머
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (cooldown > 0) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (!res.ok) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)

        if (newAttempts >= MAX_ATTEMPTS) {
          setCooldown(COOLDOWN_SECONDS)
          setAttempts(0)
          setError(`${MAX_ATTEMPTS}회 실패하여 ${COOLDOWN_SECONDS}초 후에 다시 시도할 수 있습니다.`)
        } else {
          setError(`이메일 또는 비밀번호가 올바르지 않습니다. (${newAttempts}/${MAX_ATTEMPTS})`)
        }
        return
      }

      router.refresh()
    } catch {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const isLocked = cooldown > 0

  return (
    <div className="max-w-sm mx-auto">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* 헤더 */}
        <div className="flex flex-col items-center mb-6 space-y-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold text-foreground">관리자 로그인</h1>
          <p className="text-xs text-muted-foreground">비개발자의 개발실 관리자 전용</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLocked && (
          <div className="flex items-center justify-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/50 p-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
            <span className="font-mono font-bold text-lg">{cooldown}</span>
            <span>초 후 재시도 가능</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>이메일</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={submitting || isLocked}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <Label>비밀번호</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                disabled={submitting || isLocked}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLocked}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-muted-foreground">
          비밀번호 변경은 Supabase 대시보드에서 하세요.
        </p>
      </div>
    </div>
  )
}
