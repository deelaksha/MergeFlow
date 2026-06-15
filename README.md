# MergeFlow

> **Simple Visual Code Comparison Platform**

A clean, intuitive web application for comparing and editing code files side-by-side. Built with Next.js 15, React 19, and Monaco Editor.

## Features

### Core Functionality
- ✅ **Two-Panel Editor** - Side-by-side code comparison
- ✅ **Direct Editing** - Edit code in both panels in real-time
- ✅ **File Upload** - Upload files to either panel
- ✅ **Paste Support** - Paste code directly into empty panels
- ✅ **Syntax Highlighting** - Language-specific color coding via Monaco Editor
- ✅ **Dark/Light Mode** - Theme switching
- ✅ **Download** - Export either left or right panel content

### Supported Languages
- JavaScript / TypeScript
- Python
- Java
- Go
- C / C++
- XML / HTML
- JSON
- YAML
- Shell Scripts
- Plain Text

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to use the application.

## How to Use

### Method 1: Upload Files
1. Click **"Upload"** button on the left panel header
2. Select your original file
3. Click **"Upload"** button on the right panel header
4. Select your modified file
5. Both files will appear in Monaco editors
6. Edit directly in either panel

### Method 2: Paste Code
1. On page load, you'll see empty panels with paste areas
2. Click inside the textarea and paste your code
3. The Monaco editor will automatically appear
4. Repeat for the other panel
5. Edit as needed

### Method 3: Type Directly
1. Click the textarea in either empty panel
2. Start typing your code
3. Monaco editor will load with syntax highlighting
4. Continue editing in the full editor

### Additional Features

**Compare Files** (Optional)
- Once both panels have content, click **"Compare Files"** in the header
- This will analyze differences and generate statistics
- Useful for understanding what changed

**Download**
- Click **"Download Left"** to save the left panel content
- Click **"Download Right"** to save the right panel content
- Files download with their original names

**Reset**
- Click **"Reset"** (↻) button to clear both panels
- Start fresh with new files

**Theme Toggle**
- Click **Sun/Moon** icon to switch between light and dark themes
- Your preference is saved automatically

## User Interface

```
┌─────────────────────────────────────────────────────────┐
│  MergeFlow           [Compare] [↓Left] [↓Right] [↻] [☀] │
├─────────────────────┬───────────────────────────────────┤
│  Original File  [⬆] │  Modified File  [⬆]               │
├─────────────────────┼───────────────────────────────────┤
│                     │                                   │
│  Monaco Editor      │  Monaco Editor                    │
│  (Editable)         │  (Editable)                       │
│                     │                                   │
│  - Syntax highlight │  - Syntax highlight               │
│  - Line numbers     │  - Line numbers                   │
│  - Code folding     │  - Code folding                   │
│  - Auto-complete    │  - Auto-complete                  │
│                     │                                   │
└─────────────────────┴───────────────────────────────────┘
```

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS
- **Editor**: Monaco Editor (VS Code engine)
- **State**: Zustand
- **Theme**: next-themes
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
CoflictFlow/
├── app/
│   ├── layout.tsx         # Root layout with theme
│   ├── page.tsx           # Main page (simple)
│   └── globals.css        # Global styles
├── components/
│   ├── editor/
│   │   └── editor-panel.tsx    # Two-panel editor
│   ├── header/
│   │   └── header.tsx          # Header with controls
│   ├── ui/
│   │   └── button.tsx          # Button component
│   └── theme-provider.tsx      # Theme wrapper
├── lib/
│   ├── stores/
│   │   └── merge-store.ts      # State management
│   ├── types/
│   │   └── index.ts            # Type definitions
│   └── utils/
│       ├── cn.ts               # Utility functions
│       └── language-detector.ts # Language detection
└── public/                      # Static assets
```

## Editor Features

### Monaco Editor Benefits
- Full VS Code editing experience
- IntelliSense and auto-completion
- Syntax validation
- Multi-cursor editing
- Find and replace
- Code folding
- Bracket matching
- Line numbers
- Minimap navigation

### Keyboard Shortcuts
Monaco Editor supports standard VS Code shortcuts:
- `Ctrl/Cmd + F` - Find
- `Ctrl/Cmd + H` - Replace
- `Ctrl/Cmd + D` - Select next occurrence
- `Alt + Up/Down` - Move line up/down
- `Ctrl/Cmd + /` - Toggle comment
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo

## Use Cases

### Code Review
- Paste original code on left
- Paste modified code on right
- Review changes side-by-side
- Edit directly if needed

### Merge Conflicts
- Put your version on left
- Put their version on right
- Manually combine by editing
- Download the final result

### Learning & Teaching
- Show "before" code on left
- Show "after" code on right
- Explain differences
- Students can edit and experiment

### Quick Diff
- Upload two files
- Compare visually
- No need for command-line tools

## Performance

- Handles files up to 10,000+ lines smoothly
- Fast load times
- Efficient rendering with virtualization
- Responsive on modern browsers

## Browser Compatibility

**Recommended:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

```bash
# Development mode (with hot reload)
npm run dev

# Type checking
npm run lint

# Production build
npm run build

# Production server
npm start
```

## Future Enhancements

Potential features for future versions:
- Three-way merge support
- Git integration
- Collaborative editing
- Export to diff/patch formats
- More language support
- Custom themes
- File history

## Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - free for personal and commercial use.

## Support

For issues or questions:
- Check this README
- Review the code documentation
- Open a GitHub issue

---

**Simple. Clean. Powerful.**

Built with ❤️ using Next.js and Monaco Editor
