'use client'

import { Card, Col, Row, Skeleton, Space } from 'antd'
import type { CSSProperties, ReactNode } from 'react'

const skeletonBlockStyle = (height: number, width: CSSProperties['width'] = '100%'): CSSProperties => ({
  width,
  height,
  borderRadius: 6,
})

function SkeletonField({ labelWidth = 88 }: { labelWidth?: number }) {
  return (
    <div className="digivla-skeleton-field">
      <Skeleton.Input active size="small" style={skeletonBlockStyle(12, labelWidth)} />
      <Skeleton.Input active style={skeletonBlockStyle(36)} />
    </div>
  )
}

export function DashboardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: count }).map((_, index) => (
        <Col xs={24} sm={12} xl={6} key={index}>
          <Card className="digivla-skeleton-card" variant="borderless">
            <Skeleton.Input active size="small" style={skeletonBlockStyle(14, '45%')} />
            <Skeleton.Input active style={{ ...skeletonBlockStyle(28, '55%'), marginTop: 12 }} />
            <Skeleton.Input active size="small" style={{ ...skeletonBlockStyle(12, '70%'), marginTop: 10 }} />
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export function DashboardActivitySkeleton() {
  return (
    <Card className="digivla-skeleton-card" variant="borderless" style={{ marginTop: 16 }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Skeleton.Input active size="small" style={skeletonBlockStyle(14, 120)} />
          <Skeleton.Input active size="small" style={{ ...skeletonBlockStyle(12, 280), marginTop: 10 }} />
        </div>
        <Skeleton.Button active style={skeletonBlockStyle(36, 140)} />
      </Space>
    </Card>
  )
}

export function ListTableSkeleton({
  rows = 8,
  columns = 5,
  columnWidths,
  showToolbar = true,
}: {
  rows?: number
  columns?: number
  columnWidths?: (number | string)[]
  showToolbar?: boolean
}) {
  const widths = columnWidths ?? Array.from({ length: columns }, (_, index) =>
    index === 1 ? 180 : index === 0 ? 72 : 96
  )

  return (
    <div className="digivla-table-skeleton" aria-busy aria-label="Loading table">
      {showToolbar && (
        <Space wrap size={12} style={{ marginBottom: 16 }}>
          <Skeleton.Input active style={skeletonBlockStyle(36, 220)} />
          <Skeleton.Input active style={skeletonBlockStyle(36, 140)} />
          <Skeleton.Input active style={skeletonBlockStyle(36, 120)} />
          <Skeleton.Button active style={skeletonBlockStyle(36, 96)} />
        </Space>
      )}

      <div className="digivla-table-skeleton-panel">
        <div className="digivla-table-skeleton-head">
          {widths.map((width, index) => (
            <Skeleton.Input
              key={`head-${index}`}
              active
              size="small"
              style={skeletonBlockStyle(12, width)}
            />
          ))}
        </div>

        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="digivla-table-skeleton-row"
            style={{ opacity: 1 - rowIndex * 0.04 }}
          >
            {widths.map((width, colIndex) => (
              <Skeleton.Input
                key={`cell-${rowIndex}-${colIndex}`}
                active
                size="small"
                style={skeletonBlockStyle(14, colIndex === 1 ? width : Math.min(Number(width) || 96, 120))}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="digivla-table-skeleton-pagination">
        <Skeleton.Input active size="small" style={skeletonBlockStyle(12, 120)} />
        <Skeleton.Input active style={skeletonBlockStyle(32, 220)} />
      </div>
    </div>
  )
}

export function UploadFormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="digivla-form-skeleton" aria-busy aria-label="Loading form">
      {Array.from({ length: fields }).map((_, index) => (
        <SkeletonField key={index} labelWidth={index % 3 === 0 ? 96 : 72} />
      ))}
      <Space style={{ marginTop: 8 }}>
        <Skeleton.Button active style={skeletonBlockStyle(36, 88)} />
        <Skeleton.Button active style={skeletonBlockStyle(36, 132)} />
      </Space>
    </div>
  )
}

export function PageSectionSkeleton({
  title = true,
  children,
}: {
  title?: boolean
  children?: ReactNode
}) {
  return (
    <Card className="digivla-skeleton-card" variant="borderless">
      {title && <Skeleton.Input active size="small" style={{ ...skeletonBlockStyle(16, 180), marginBottom: 16 }} />}
      {children ?? <UploadFormSkeleton fields={4} />}
    </Card>
  )
}

/** Initial table load: skeleton. Refresh with existing rows: antd table spinner. */
export function shouldShowTableSkeleton(loading: boolean, rowCount: number) {
  return loading && rowCount === 0
}
