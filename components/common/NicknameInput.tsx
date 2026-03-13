'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface NicknameInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
}

const MAX_LENGTH = 20

export function NicknameInput({
  value,
  onChange,
  label = '닉네임',
  placeholder = '닉네임을 입력하세요',
  error,
  required = false,
  className,
}: NicknameInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val.length <= MAX_LENGTH) {
      onChange(val)
    }
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={MAX_LENGTH}
          className={cn(error && 'border-destructive focus-visible:ring-destructive/30')}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        닉네임은 신원 확인 수단이 아닙니다. 자유롭게 입력하세요.
      </p>
    </div>
  )
}
