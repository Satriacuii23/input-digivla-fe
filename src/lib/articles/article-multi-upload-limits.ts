export const MAX_MULTI_UPLOAD_ARTICLES = 50

export function canAddMoreMultiUploadArticles(articleCount: number): boolean {
  return articleCount < MAX_MULTI_UPLOAD_ARTICLES
}

export function multiUploadCountLabel(articleCount: number): string {
  return `${articleCount}/${MAX_MULTI_UPLOAD_ARTICLES}`
}
