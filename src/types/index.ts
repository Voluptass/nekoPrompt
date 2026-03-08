export type Platform = 'sd' | 'dalle' | 'mj' | 'general'

export interface Tag {
  id: string
  text: string
  category: string
  aliases?: string[]
  description?: string
  platforms?: Platform[]
}

export interface Category {
  id: string
  name: string
  icon?: string
  order: number
}

export interface SelectedTag {
  tagId: string
  weight?: number
}

export interface Preset {
  id: string
  name: string
  tags: SelectedTag[]
  negativeTags: SelectedTag[]
  createdAt: number
}

export interface UserSettings {
  defaultPlatform: Platform
}

export interface UserData {
  version: number
  customTags: Tag[]
  customCategories: Category[]
  hiddenBuiltinTags: string[]
  presets: Preset[]
  settings: UserSettings
}

export interface WorkspaceState {
  selectedTags: SelectedTag[]
  negativeTags: SelectedTag[]
}
