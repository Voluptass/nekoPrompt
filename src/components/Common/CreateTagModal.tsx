import { useEffect, useState } from 'react'
import { useAllCategories } from '../../hooks/useAllTags'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import type { Platform, Tag } from '../../types'

interface CreateTagModalProps {
  open: boolean
  onClose: () => void
  editTag?: Tag
}

const ALL_PLATFORMS: Platform[] = ['sd', 'dalle', 'mj', 'general']

function getPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'sd':
      return 'SD'
    case 'dalle':
      return 'DALL·E'
    case 'mj':
      return 'MJ'
    default:
      return 'General'
  }
}

export function CreateTagModal({ open, onClose, editTag }: CreateTagModalProps) {
  const { addCustomTag, updateCustomTag, addCustomCategory } = useCustomTagStore()
  const allCategories = useAllCategories()
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [category, setCategory] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aliases, setAliases] = useState('')
  const [description, setDescription] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    if (!open) return

    setText(editTag?.text ?? '')
    setTranslation(editTag?.translation ?? '')
    setCategory(editTag?.category ?? '')
    setShowAdvanced(Boolean(editTag?.aliases?.length || editTag?.description || editTag?.platforms?.length))
    setAliases(editTag?.aliases?.join(', ') ?? '')
    setDescription(editTag?.description ?? '')
    setPlatforms(editTag?.platforms ?? [])
    setShowNewCategory(false)
    setNewCategoryName('')
  }, [editTag, open])

  if (!open) return null

  const handleClose = () => {
    onClose()
  }

  const togglePlatform = (platform: Platform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    )
  }

  const handleSubmit = () => {
    const trimmedText = text.trim()
    const trimmedTranslation = translation.trim()
    const trimmedNewCategoryName = newCategoryName.trim()

    if (!trimmedText) return
    if (!showNewCategory && !category) return
    if (showNewCategory && !trimmedNewCategoryName) return

    let categoryId = category

    if (showNewCategory) {
      addCustomCategory({ name: trimmedNewCategoryName })
      const customCategories = useCustomTagStore.getState().customCategories
      const createdCategory = customCategories[customCategories.length - 1]
      categoryId = createdCategory?.id ?? ''
    }

    if (!categoryId) return

    const tagData: Omit<Tag, 'id'> = {
      text: trimmedText,
      category: categoryId,
      ...(trimmedTranslation ? { translation: trimmedTranslation } : {}),
      ...(aliases.trim()
        ? {
            aliases: aliases
              .split(',')
              .map((alias) => alias.trim())
              .filter(Boolean),
          }
        : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(platforms.length > 0 ? { platforms } : {}),
    }

    if (editTag) {
      updateCustomTag(editTag.id, tagData)
    } else {
      addCustomTag(tagData)
    }

    handleClose()
  }

  const title = editTag ? '编辑标签' : '新建标签'
  const submitLabel = editTag ? '保存' : '创建'
  const submitDisabled =
    !text.trim() || (!showNewCategory && !category) || (showNewCategory && !newCategoryName.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <button
            type="button"
            aria-label={`关闭${title}`}
            onClick={handleClose}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="custom-tag-text" className="mb-1 block text-xs text-zinc-400">
              标签文本
            </label>
            <input
              id="custom-tag-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="例如: cyberpunk city"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500"
            />
          </div>

          <div>
            <label htmlFor="custom-tag-translation" className="mb-1 block text-xs text-zinc-400">
              汉语翻译
            </label>
            <input
              id="custom-tag-translation"
              value={translation}
              onChange={(event) => setTranslation(event.target.value)}
              placeholder="例如: 赛博朋克城市"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500"
            />
          </div>

          <div>
            <label htmlFor="custom-tag-category" className="mb-1 block text-xs text-zinc-400">
              分类
            </label>
            {showNewCategory ? (
              <div className="flex items-center gap-2">
                <input
                  id="custom-tag-new-category"
                  aria-label="新分类名称"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="新分类名称"
                  className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false)
                    setNewCategoryName('')
                  }}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  取消
                </button>
              </div>
            ) : (
              <select
                id="custom-tag-category"
                value={category}
                onChange={(event) => {
                  if (event.target.value === '__new__') {
                    setShowNewCategory(true)
                    setCategory('')
                    return
                  }

                  setCategory(event.target.value)
                }}
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500"
              >
                <option value="">选择分类...</option>
                {allCategories.map((categoryOption) => (
                  <option key={categoryOption.id} value={categoryOption.id}>
                    {categoryOption.name}
                  </option>
                ))}
                <option value="__new__">新建分类...</option>
              </select>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              className="text-xs text-violet-400 transition-colors hover:text-violet-300"
            >
              {showAdvanced ? '▼' : '▶'} 高级选项
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3 border-l-2 border-zinc-700 pl-3">
                <div>
                  <label htmlFor="custom-tag-aliases" className="mb-1 block text-xs text-zinc-400">
                    别名
                  </label>
                  <input
                    id="custom-tag-aliases"
                    value={aliases}
                    onChange={(event) => setAliases(event.target.value)}
                    placeholder="逗号分隔"
                    className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500"
                  />
                </div>

                <div>
                  <label htmlFor="custom-tag-description" className="mb-1 block text-xs text-zinc-400">
                    描述
                  </label>
                  <input
                    id="custom-tag-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="标签用途说明"
                    className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-violet-500"
                  />
                </div>

                <div>
                  <span className="mb-1 block text-xs text-zinc-400">适用平台</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`rounded px-2 py-1 text-xs transition-colors ${
                          platforms.includes(platform)
                            ? 'bg-violet-600 text-white'
                            : 'border border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {getPlatformLabel(platform)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitDisabled}
            className="rounded bg-violet-600 px-4 py-1.5 text-xs text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
