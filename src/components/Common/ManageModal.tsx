import { useState } from 'react'
import { useAllCategories } from '../../hooks/useAllTags'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import type { Tag } from '../../types'
import { CreateTagModal } from './CreateTagModal'

interface ManageModalProps {
  open: boolean
  onClose: () => void
}

type Tab = 'tags' | 'categories'

export function ManageModal({ open, onClose }: ManageModalProps) {
  const {
    customTags,
    customCategories,
    deleteCustomTag,
    deleteCustomCategory,
    updateCustomCategory,
  } = useCustomTagStore()
  const allCategories = useAllCategories()
  const [tab, setTab] = useState<Tab>('tags')
  const [editTag, setEditTag] = useState<Tag | undefined>()
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!open) return null

  const getCategoryName = (categoryId: string) =>
    allCategories.find((category) => category.id === categoryId)?.name ?? categoryId

  const commitCategoryName = (categoryId: string, fallbackName: string) => {
    const nextName = editCategoryName.trim() || fallbackName
    updateCustomCategory(categoryId, { name: nextName })
    setEditCategoryId(null)
    setEditCategoryName('')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="管理自定义标签"
          className="flex max-h-[75vh] w-full max-w-2xl flex-col rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h3 className="text-sm font-semibold text-zinc-100">管理自定义标签</h3>
            <button
              type="button"
              aria-label="关闭管理自定义标签"
              onClick={onClose}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2 border-b border-zinc-800 px-4 py-3">
            <button
              type="button"
              onClick={() => setTab('tags')}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                tab === 'tags'
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              标签
            </button>
            <button
              type="button"
              onClick={() => setTab('categories')}
              className={`rounded px-3 py-1 text-xs transition-colors ${
                tab === 'categories'
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              分类
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'tags' && (
              <>
                {customTags.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-500">还没有自定义标签</p>
                ) : (
                  <div className="space-y-2">
                    {customTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-start justify-between gap-3 rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-zinc-100">{tag.text}</p>
                          {tag.translation && (
                            <p className="text-xs text-zinc-400">{tag.translation}</p>
                          )}
                          <p className="text-xs text-zinc-500">{getCategoryName(tag.category)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`编辑标签 ${tag.text}`}
                            onClick={() => setEditTag(tag)}
                            className="text-xs text-zinc-400 transition-colors hover:text-violet-300"
                          >
                            编辑
                          </button>
                          {confirmDeleteId === tag.id ? (
                            <button
                              type="button"
                              aria-label={`确认删除标签 ${tag.text}`}
                              onClick={() => {
                                deleteCustomTag(tag.id)
                                setConfirmDeleteId(null)
                              }}
                              className="text-xs text-red-400 transition-colors hover:text-red-300"
                            >
                              确认删除
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label={`删除标签 ${tag.text}`}
                              onClick={() => setConfirmDeleteId(tag.id)}
                              className="text-xs text-zinc-400 transition-colors hover:text-red-300"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'categories' && (
              <>
                {customCategories.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-500">还没有自定义分类</p>
                ) : (
                  <div className="space-y-2">
                    {customCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between gap-3 rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2"
                      >
                        {editCategoryId === category.id ? (
                          <input
                            aria-label={`分类名称 ${category.name}`}
                            value={editCategoryName}
                            onChange={(event) => setEditCategoryName(event.target.value)}
                            onBlur={() => commitCategoryName(category.id, category.name)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                commitCategoryName(category.id, category.name)
                              }
                            }}
                            className="flex-1 rounded border border-violet-500 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 outline-none"
                            autoFocus
                          />
                        ) : (
                          <p className="text-sm text-zinc-100">{category.name}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`编辑分类 ${category.name}`}
                            onClick={() => {
                              setEditCategoryId(category.id)
                              setEditCategoryName(category.name)
                            }}
                            className="text-xs text-zinc-400 transition-colors hover:text-violet-300"
                          >
                            编辑
                          </button>
                          {confirmDeleteId === category.id ? (
                            <button
                              type="button"
                              aria-label={`确认删除分类 ${category.name}`}
                              onClick={() => {
                                deleteCustomCategory(category.id)
                                setConfirmDeleteId(null)
                              }}
                              className="text-xs text-red-400 transition-colors hover:text-red-300"
                            >
                              确认删除
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label={`删除分类 ${category.name}`}
                              onClick={() => setConfirmDeleteId(category.id)}
                              className="text-xs text-zinc-400 transition-colors hover:text-red-300"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
            共 {customTags.length} 个自定义标签，{customCategories.length} 个自定义分类
          </div>
        </div>
      </div>

      <CreateTagModal
        open={Boolean(editTag)}
        editTag={editTag}
        onClose={() => setEditTag(undefined)}
      />
    </>
  )
}
