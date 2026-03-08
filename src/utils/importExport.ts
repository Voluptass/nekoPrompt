import type { UserData } from '../types'

export function exportUserData(data: UserData): string {
  return JSON.stringify(data, null, 2)
}

interface ValidateResult {
  success: boolean
  data?: UserData
  error?: string
}

export function validateImport(json: string): ValidateResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { success: false, error: 'Invalid JSON' }
  }

  if (!parsed || typeof parsed !== 'object' || !('version' in parsed)) {
    return { success: false, error: 'Missing version field' }
  }

  return { success: true, data: parsed as UserData }
}

export function triggerDownload(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
