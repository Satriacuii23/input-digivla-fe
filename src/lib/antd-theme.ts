import type { ThemeConfig } from 'antd'

const navy = '#1e3a5f'
const navyMuted = '#475569'

export const digivlaTheme: ThemeConfig = {
  token: {
    colorPrimary: navy,
    colorInfo: navy,
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorBgLayout: '#f5f7fa',
    colorBgContainer: '#ffffff',
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    controlHeight: 40,
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      triggerBg: '#f0f4f8',
      bodyBg: '#f5f7fa',
      headerBg: '#ffffff',
    },
    Menu: {
      itemBg: '#ffffff',
      itemColor: navy,
      itemHoverBg: '#f0f4f8',
      itemHoverColor: navy,
      itemSelectedBg: '#e8eef5',
      itemSelectedColor: navy,
      itemActiveBg: '#e8eef5',
      subMenuItemBg: '#ffffff',
      groupTitleColor: navyMuted,
      popupBg: '#ffffff',
      iconSize: 18,
      iconMarginInlineEnd: 12,
      itemHeight: 40,
      collapsedIconSize: 18,
    },
    Drawer: {
      colorBgMask: 'rgba(15, 32, 53, 0.35)',
    },
    Table: {
      headerBg: '#f0f4f8',
      headerColor: navy,
      rowHoverBg: '#f8fafc',
      borderColor: '#e2e8f0',
    },
    Card: {
      paddingLG: 24,
    },
    Skeleton: {
      gradientFromColor: '#eef2f7',
      gradientToColor: '#f8fafc',
      titleHeight: 14,
      paragraphLiHeight: 14,
      blockRadius: 6,
    },
  },
}
