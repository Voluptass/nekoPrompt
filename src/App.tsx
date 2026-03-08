import { useState } from 'react'
import { Header, StatusBar } from './components/Common'
import { TagLibrary } from './components/TagLibrary'
import { Workspace } from './components/Workspace'
import { Preview } from './components/Preview'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 shrink-0">
          <TagLibrary searchQuery={searchQuery} />
        </div>
        <div className="flex-1 border-x border-zinc-800">
          <Workspace />
        </div>
        <div className="w-80 shrink-0">
          <Preview />
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
