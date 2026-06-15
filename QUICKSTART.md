# MergeFlow - Quick Start Guide

## Installation & Setup

```bash
# Navigate to project directory
cd /home/sonic-claude/deelaksha/CoflictFlow

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

## How to Use

### 1. Upload Files
- Click or drag-and-drop your **Original File** (left panel)
- Click or drag-and-drop your **Modified File** (right panel)
- Supported formats: `.js`, `.ts`, `.py`, `.java`, `.go`, `.cpp`, `.c`, `.xml`, `.json`, `.yaml`, `.sh`, `.txt`

### 2. Compare Files
- Click the **"Compare Files"** button
- The application will automatically:
  - Generate line-by-line diff
  - Detect conflicts (line, block, function, class, import levels)
  - Analyze security risks
  - Calculate statistics

### 3. Navigate Changes
- Use the **left sidebar** to browse all detected conflicts
- Click any conflict to view details
- Risk indicators:
  - 🔴 High-risk changes (auth, database, API)
  - 🟡 Medium-risk changes (network, config)
  - ⚪ Low-risk changes

### 4. Resolve Conflicts
Click on any conflict in the sidebar, then use the merge controls at the bottom:

**Individual Actions:**
- **Accept Left** - Use original version
- **Accept Right** - Use modified version
- **Accept Both** - Merge both versions
- **Smart Merge** - AI-assisted intelligent merge

**Bulk Actions:**
- **Accept All Left** - Resolve all with original
- **Accept All Right** - Resolve all with modified
- **Resolve Safe Changes** - Auto-resolve low-risk conflicts only

### 5. View Results
- The **Merged Output** panel (right side) shows the final result in real-time
- Monaco editor provides syntax highlighting and code folding

### 6. Download
- Click the **Download** button in the header
- The merged file will be saved to your downloads folder

## Key Features Demonstrated

### Statistics Panel
At the top, you'll see:
- ➕ Lines added (green)
- ➖ Lines deleted (red)
- ✏️ Lines modified (yellow)
- Function/class/import changes
- High-risk change count

### Undo/Redo
- Click **Undo** (⟲) to revert last action
- Click **Redo** (⟳) to re-apply
- Keyboard: `Ctrl+Z` / `Ctrl+Shift+Z`

### Theme Toggle
- Click **Sun/Moon** icon to switch between light and dark modes
- Theme persists across sessions

### Editor Features
- Line numbers
- Syntax highlighting
- Code folding
- Minimap (right side)
- Scroll synchronization

## Example Workflow

1. **Upload** two JavaScript files with different implementations
2. **Compare** to see the diff
3. Navigate to a detected **function conflict**
4. See risk warning: "API endpoint modified"
5. Review both versions in the editor
6. Choose **"Smart Merge"** or manually **"Accept Right"**
7. Repeat for remaining conflicts
8. Use **"Resolve Safe Changes"** to auto-resolve low-risk items
9. **Download** the final merged file

## Advanced Tips

### Bulk Resolution
- For large files with many conflicts, use bulk operations
- "Resolve Safe Changes" will skip high-risk conflicts automatically

### Risk Detection
- Pay attention to red warnings for:
  - Authentication logic changes
  - Database query modifications
  - API endpoint alterations
  - Security configuration updates

### History
- You can undo/redo unlimited times
- History is maintained for the entire session
- Use **Reset** button to start fresh

## Keyboard Shortcuts (Coming Soon)

- `A` - Accept Left
- `D` - Accept Right
- `B` - Accept Both
- `M` - Smart Merge
- `N` - Next Change
- `P` - Previous Change
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

## Technical Architecture

### Core Engines
1. **Diff Engine** - Uses `jsdiff` for line comparison
2. **Conflict Detection** - Semantic analysis (functions, classes, imports)
3. **Risk Detection** - Pattern matching for high-risk code
4. **Merge Engine** - Resolution logic with smart merge
5. **History Manager** - Undo/redo state management
6. **Search Engine** - Cross-file search capability

### State Management
- **Zustand** store handles all application state
- Real-time updates across all panels
- Efficient re-rendering

### UI Components
- **Monaco Editor** - VS Code editor integration
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Lucide Icons** - Consistent icon system

## Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel deploy
```

## Troubleshooting

### Build Warnings
- ESLint warnings are non-critical and won't affect functionality
- They're marked for future cleanup

### File Upload Issues
- Ensure files are text-based (not binary)
- Maximum recommended size: 20 MB
- For very large files (>10,000 lines), performance may vary

### Browser Compatibility
- Best experience in Chrome, Firefox, Safari, Edge (latest versions)
- Requires JavaScript enabled

## Next Steps

- Explore different file types (Python, JSON, XML)
- Test with large files
- Try different merge strategies
- Experiment with bulk operations
- Check out risk detection on security-sensitive code

## Support

For issues or questions:
- Check the main `README.md`
- Review the codebase documentation
- Open an issue on GitHub

---

**Happy Merging! 🚀**
