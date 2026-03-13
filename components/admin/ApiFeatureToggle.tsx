'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { VcAdminSettings } from '@/output/step2_types'

interface ApiFeatureToggleProps {
  setting: VcAdminSettings
  onUpdate: (key: string, value: string) => void
}

export function ApiFeatureToggle({ setting, onUpdate }: ApiFeatureToggleProps) {
  const [saving, setSaving] = useState(false)
  const isEnabled = setting.value === 'true'

  async function handleToggle() {
    setSaving(true)
    const newValue = isEnabled ? 'false' : 'true'

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: setting.key, value: newValue }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '저장 실패')
      }

      onUpdate(setting.key, newValue)
    } catch (err) {
      alert(err instanceof Error ? err.message : '설정 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Sparkles className={`h-5 w-5 mt-0.5 shrink-0 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
        <div>
          <p className="text-sm font-medium text-foreground">{setting.label ?? setting.key}</p>
          {setting.key === 'ai_refine_enabled' && (
            <p className="text-xs text-muted-foreground mt-0.5">
              앱 소개글 작성 시 Claude Haiku로 글을 다듬는 기능 · 예상 비용: 회당 약 $0.00035
            </p>
          )}
        </div>
      </div>

      {/* 토글 스위치 */}
      <button
        onClick={handleToggle}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
          isEnabled ? 'bg-primary' : 'bg-muted'
        }`}
        role="switch"
        aria-checked={isEnabled}
        aria-label={`${setting.label ?? setting.key} ${isEnabled ? '비활성화' : '활성화'}`}
      >
        {saving ? (
          <span className="flex h-5 w-5 items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-white" />
          </span>
        ) : (
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        )}
      </button>
    </div>
  )
}
