export interface ArticleUploadFormLike {
  media_id: string | null
  title: string
  date: Date | null
}

export function isArticleUploadFormReady(form: ArticleUploadFormLike): boolean {
  return Boolean(form.media_id && form.title.trim() && form.date)
}

export function getIncompleteArticleFormIndices(
  forms: ArticleUploadFormLike[],
  indices?: number[],
): number[] {
  const targets = indices ?? forms.map((_, index) => index)
  return targets.filter((index) => {
    const form = forms[index]
    return !form || !isArticleUploadFormReady(form)
  })
}

export function getReadyArticleFormIndices(forms: ArticleUploadFormLike[]): number[] {
  return forms
    .map((form, index) => (isArticleUploadFormReady(form) ? index : -1))
    .filter((index) => index >= 0)
}

export function formatArticleFormNumbers(indices: number[]): string {
  return indices.map((index) => index + 1).join(', ')
}

export function getArticleUploadMissingFieldLabels(form: ArticleUploadFormLike): string[] {
  const missing: string[] = []
  if (!form.media_id) missing.push('media')
  if (!form.title.trim()) missing.push('title')
  if (!form.date) missing.push('date')
  return missing
}

export function getSingleUploadValidationMessage(form: ArticleUploadFormLike): string | null {
  if (isArticleUploadFormReady(form)) return null

  const missing = getArticleUploadMissingFieldLabels(form)
  if (missing.length === 3) {
    return 'No article ready to upload. Each article requires media, title, and date.'
  }

  return `Cannot upload article. Required: ${missing.join(', ')}.`
}

export function getMultiUploadValidationMessage(forms: ArticleUploadFormLike[]): string | null {
  if (getReadyArticleFormIndices(forms).length > 0) return null
  return 'No articles ready to upload. Each article requires media, title, and date.'
}

export function getMultiUploadSubmitValidationMessage(
  forms: ArticleUploadFormLike[],
  selectedIndices: number[],
): string | null {
  const incompleteSelected = getIncompleteArticleFormIndices(forms, selectedIndices)
  if (incompleteSelected.length === 0) return null
  return `Cannot upload article(s) #${formatArticleFormNumbers(incompleteSelected)}. Media, title, and date are required.`
}
