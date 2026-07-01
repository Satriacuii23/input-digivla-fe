import type { ArticleUploadBatchValues } from '@/components/articles/article-upload-batch-drawer'

export interface BroadcastMultiFormBatchTarget {
  media_id: string | null
  title: string
  content: string
  date: Date | null
  journalist: string
  time: string
  duration: number | string
  file: File | null
  filePath: string
}

type UpdateFilePath = (form: BroadcastMultiFormBatchTarget) => void

export function applyBatchToBroadcastForms<T extends BroadcastMultiFormBatchTarget>(
  forms: T[],
  targets: number[],
  batch: ArticleUploadBatchValues,
  updateFilePath?: UpdateFilePath,
): T[] {
  return forms.map((form, idx) => {
    if (!targets.includes(idx)) return form

    const pos = targets.indexOf(idx)
    const next = { ...form }

    if (batch.mediaId) next.media_id = batch.mediaId
    if (batch.date) next.date = batch.date

    const titleLine = batch.titlesPerForm?.[pos]
    if (titleLine) next.title = titleLine
    else if (batch.title) next.title = batch.title

    const contentBlock = batch.contentsPerForm?.[pos]
    if (contentBlock) next.content = contentBlock
    else if (batch.content) next.content = batch.content

    const journalistLine = batch.journalistsPerForm?.[pos]
    if (journalistLine) next.journalist = journalistLine
    else if (batch.journalist) next.journalist = batch.journalist

    const timeLine = batch.timesPerForm?.[pos]
    if (timeLine) next.time = timeLine
    else if (batch.time) next.time = batch.time

    const durationLine = batch.durationsPerForm?.[pos]
    if (durationLine) next.duration = durationLine
    else if (batch.duration) next.duration = batch.duration

    if (updateFilePath) updateFilePath(next)
    return next
  })
}
