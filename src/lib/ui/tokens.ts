/** Digivla IDS design tokens — white & dark blue, no gradients */
export const colors = {
  navy: '#1e3a5f',
  navyDark: '#152a45',
  navyLight: '#e8eef5',
  navyMuted: '#2d5a8a',
  white: '#ffffff',
  bg: '#f4f6f9',
  bgMuted: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
} as const

export const shadows = {
  sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
  md: '0 1px 3px rgba(15, 23, 42, 0.06)',
} as const

export const inputStyles = {
  label: { color: colors.textSecondary, fontWeight: 500, fontSize: 13 },
  input: {
    borderColor: colors.border,
    backgroundColor: colors.white,
    '&:focus': { borderColor: colors.navy },
  },
} as const

export const panelStyle = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.md,
  overflow: 'hidden' as const,
}

export const filterBarStyle = {
  background: colors.bgMuted,
  borderBottom: `1px solid ${colors.border}`,
}

export const footerBarStyle = {
  background: colors.bgMuted,
  borderTop: `1px solid ${colors.border}`,
}
