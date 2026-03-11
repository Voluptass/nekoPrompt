import { useState, useCallback } from 'react'
import { usePromptStore } from '../../stores/usePromptStore'
import { builtinTags } from '../../data'
import { formatSD, formatDallE, formatDallENegative } from '../../utils/formatPrompt'
import type { Tag } from '../../types'

type Format = 'sd' | 'dalle'

const findTag = (id: string): Tag =>
  builtinTags.find((t) => t.id === id) ?? { id, text: id, category: '' }

export function Preview() {
  const selectedTags = usePromptStore((s) => s.selectedTags)
  const negativeTags = usePromptStore((s) => s.negativeTags)
  const [format, setFormat] = useState<Format>('sd')
  const [copied, setCopied] = useState(false)

  const positiveText =
    format === 'sd' ? formatSD(selectedTags, findTag) : formatDallE(selectedTags, findTag)
  const negativeText =
    format === 'sd'
      ? formatSD(negativeTags, findTag)
      : formatDallENegative(negativeTags, findTag)

  const handleCopy = useCallback(async () => {
    const full = negativeText
      ? format === 'sd'
        ? `${positiveText}\n\nNegative prompt: ${negativeText}`
        : `${positiveText}\n\n${negativeText}`
      : positiveText
    await navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [format, positiveText, negativeText])

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-3 lg:border-l lg:border-zinc-800">
      {/* Format toggle */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setFormat('sd')}
          className={`px-3 py-1 text-xs rounded cursor-pointer transition-colors ${
            format === 'sd'
              ? 'bg-violet-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          SD Format
        </button>
        <button
          type="button"
          onClick={() => setFormat('dalle')}
          className={`px-3 py-1 text-xs rounded cursor-pointer transition-colors ${
            format === 'dalle'
              ? 'bg-violet-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          DALL·E Format
        </button>
      </div>

      {/* Positive prompt */}
      <div className="flex-1 flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Prompt</label>
        <textarea
          readOnly
          value={positiveText}
          className="flex-1 min-h-[100px] bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-200 resize-none focus:outline-none"
          placeholder="Select tags to generate prompt..."
        />
      </div>

      {/* Negative prompt */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Negative Prompt</label>
        <textarea
          readOnly
          value={negativeText}
          className="min-h-[60px] bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-red-300/80 resize-none focus:outline-none"
          placeholder="No negative tags..."
        />
      </div>

      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        disabled={!positiveText && !negativeText}
        className="w-full py-2 rounded text-sm font-medium transition-colors cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed
          bg-violet-600 hover:bg-violet-500 text-white"
      >
        {copied ? '✓ Copied!' : 'Copy to Clipboard'}
      </button>
    </div>
  )
}
