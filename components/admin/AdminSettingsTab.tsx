'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { ApiFeatureToggle } from './ApiFeatureToggle'
import type { VcAdminSettings } from '@/output/step2_types'

interface AdminSettingsTabProps {
  settings: VcAdminSettings[]
}

export function AdminSettingsTab({ settings: initialSettings }: AdminSettingsTabProps) {
  const [settings, setSettings] = useState<VcAdminSettings[]>(initialSettings)

  function handleUpdate(key: string, value: string) {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value, updated_at: new Date().toISOString() } : s))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">API 기능 관리</h2>
        <div className="space-y-3">
          {settings.length === 0 ? (
            <p className="text-sm text-muted-foreground">설정된 항목이 없습니다.</p>
          ) : (
            settings.map((setting) => (
              <ApiFeatureToggle
                key={setting.key}
                setting={setting}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </div>
      </div>

      <hr className="border-border" />

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">관리자 계정</h2>
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 p-4 text-sm text-blue-800 dark:text-blue-200">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">비밀번호 변경 방법</p>
            <p className="text-xs opacity-90">
              관리자 이메일/비밀번호는 Supabase 대시보드에서 변경하세요.
            </p>
            <p className="text-xs opacity-75">
              Authentication → Users → 계정 클릭 → 비밀번호 변경
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
