import { X, Search, Smile } from "lucide-react"
import { useState } from "react"

interface EmojiPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (emoji: string) => void
}

// Categorized emojis for better organization
const emojiCategories = [
  {
    name: "Smileys & People",
    emojis: ["😀", "😂", "😊", "🥰", "😎", "🤔", "😮", "👍", "👋", "❤️", "🤣", "😍", "😭", "😅", "👏", "🙌", "😘", "🥺", "😋", "🤩", "🤗", "😇", "🥳", "🤪", "😜"]
  },
  {
    name: "Objects & Symbols",
    emojis: ["🔥", "⭐", "🎉", "🙏", "💯", "✨", "🎯", "💡", "📱", "💻", "🎵", "🎮", "📚", "✈️", "🏆", "💰", "🕰️", "🔑", "🔒", "🎁"]
  },
  {
    name: "Nature & Animals",
    emojis: ["🌞", "🌙", "⭐", "🌊", "🔥", "🌸", "🌳", "🐶", "🐱", "🦁", "🐯", "🐼", "🦊", "🐰", "🐦", "🦋", "🐞", "🌻", "🍎", "🍕"]
  }
]

export function EmojiPicker({ isOpen, onClose, onSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState(0)

  if (!isOpen) return null

  // Filter emojis based on search
  const filteredEmojis = searchQuery 
    ? emojiCategories.flatMap(cat => cat.emojis)
        .filter(emoji => emoji.includes(searchQuery))
    : emojiCategories[activeCategory].emojis

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji)
    // Don't close immediately, give user time to see the selection
    setTimeout(() => onClose(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="absolute bottom-full left-0 mb-3 z-50 animate-in slide-in-from-bottom-2 duration-200">
      <div 
        className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl w-80"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-gray-300">Emojis</h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors hover:scale-110 active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {/* Search */}
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emojis..."
                className="w-full pl-9 pr-3 py-2 bg-gray-900/60 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/30"
                autoFocus
              />
            </div> */}
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex border-b border-gray-700/50">
            {emojiCategories.map((category, index) => (
              <button
                key={category.name}
                type="button"
                onClick={() => setActiveCategory(index)}
                className={`flex-1 py-2.5 text-xs font-medium transition-all duration-200 ${
                  activeCategory === index
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                {category.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Grid */}
        <div className="p-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {searchQuery && filteredEmojis.length === 0 ? (
            <div className="text-center py-8">
              <Smile className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No emojis found</p>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-700/50 group active:scale-95"
                  title={`Insert ${emoji}`}
                >
                  {/* Emoji with hover effect */}
                  <span className="text-xl group-hover:scale-110 transition-transform block">
                    {emoji}
                  </span>
                  
                  {/* Selection indicator */}
                  <div className="absolute inset-0 border-2 border-blue-400/0 rounded-lg group-hover:border-blue-400/30 transition-colors duration-200"></div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 pt-2 border-t border-gray-700/50">
          {searchQuery ? (
            <p className="text-xs text-gray-400 text-center">
              {filteredEmojis.length} emojis found
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {emojiCategories[activeCategory].name}
              </p>
              <p className="text-xs text-gray-400">
                {filteredEmojis.length} emojis
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute -bottom-2 left-4 w-4 h-4 bg-gray-800/95 border-l border-b border-gray-700/50 transform rotate-45"></div>
    </div>
  )
}