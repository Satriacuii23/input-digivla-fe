'use client'

import { TimePicker } from 'antd'
import type { TimePickerProps } from 'antd'
import { parseWibTimeForForm } from '@/lib/articles/article-list-helpers'

interface WibTimePickerProps extends Omit<TimePickerProps, 'value' | 'onChange' | 'format' | 'use12Hours'> {
  value?: string
  onChange?: (value: string) => void
}

export function WibTimePicker({ value, onChange, className, ...props }: WibTimePickerProps) {
  return (
    <TimePicker
      format="HH:mm"
      use12Hours={false}
      inputReadOnly
      placeholder="HH:mm"
      needConfirm={false}
      showNow={false}
      className={['digivla-wib-time-picker', className].filter(Boolean).join(' ')}
      style={{ width: '100%', ...(props.style as object) }}
      value={parseWibTimeForForm(value)}
      onChange={(time) => onChange?.(time ? time.format('HH:mm') : '')}
      {...props}
    />
  )
}
