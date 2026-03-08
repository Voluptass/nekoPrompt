import type { UserData, WorkspaceState } from '../types'

const USER_DATA_KEY = 'nekoPrompt:userData'
const WORKSPACE_KEY = 'nekoPrompt:workspace'

const defaultUserData: UserData = {
  version: 1,
  customTags: [],
  customCategories: [],
  hiddenBuiltinTags: [],
  presets: [],
  settings: { defaultPlatform: 'sd' },
}

const defaultWorkspace: WorkspaceState = {
  selectedTags: [],
  negativeTags: [],
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY)
    if (!raw) return { ...defaultUserData }
    return { ...defaultUserData, ...JSON.parse(raw) }
  } catch {
    return { ...defaultUserData }
  }
}

export function saveUserData(data: UserData): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data))
}

export function loadWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY)
    if (!raw) return { ...defaultWorkspace }
    return { ...defaultWorkspace, ...JSON.parse(raw) }
  } catch {
    return { ...defaultWorkspace }
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state))
}
