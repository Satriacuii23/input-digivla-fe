'use client'

import { Button, Tooltip } from 'antd'
import type { ButtonProps } from 'antd'

interface ToolbarIconButtonProps extends Omit<ButtonProps, 'children' | 'aria-label'> {
  label: string
}

export function ToolbarIconButton({ label, icon, className, ...props }: ToolbarIconButtonProps) {
  return (
    <Tooltip title={label}>
      <Button
        type="default"
        icon={icon}
        aria-label={label}
        className={['digivla-toolbar-icon-btn', className].filter(Boolean).join(' ')}
        {...props}
      />
    </Tooltip>
  )
}
