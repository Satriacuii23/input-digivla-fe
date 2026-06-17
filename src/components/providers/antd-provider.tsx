'use client'

import { AntdRegistry } from '@ant-design/nextjs-registry'
import { App, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import { digivlaTheme } from '@/lib/antd-theme'

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={digivlaTheme} locale={enUS}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  )
}
