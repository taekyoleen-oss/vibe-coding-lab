'use client'

import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { AppRequestForm } from './AppRequestForm'

interface AppRequestButtonProps {
  appId: string
  appTitle: string
}

export function AppRequestButton({ appId, appTitle }: AppRequestButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent/50 transition-colors font-medium"
      >
        <MessageSquarePlus className="h-4 w-4" />
        이 앱에 요청하기
      </button>
      {open && (
        <div className="mt-4">
          <AppRequestForm appId={appId} appTitle={appTitle} onSuccess={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
