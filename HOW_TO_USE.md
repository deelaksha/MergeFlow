# MergeFlow - How to Use Line-Level Selection

## 🎯 Line-Level Merging Guide

MergeFlow's Monaco DiffEditor provides powerful built-in capabilities for selecting and copying individual lines or blocks of code between the left and right panels.

## 📋 Selecting and Copying Lines

### Method 1: Copy Single Lines (Left to Right or Right to Left)

#### Step-by-Step:
1. **Select the line(s)** you want in either the left or right editor
   - Click at the start of a line
   - Hold Shift and click at the end to select multiple lines
   - Or triple-click to select an entire line
   - Or drag to select text

2. **Copy the selection**
   - Press `Ctrl+C` (or `Cmd+C` on Mac) to copy

3. **Click in the other editor** where you want to paste
   - Click at the exact line where you want the code

4. **Paste**
   - Press `Ctrl+V` (or `Cmd+V` on Mac) to paste
   - The code from one side is now in the other side

### Method 2: Visual Diff Navigation

The Monaco DiffEditor shows you exactly what changed:

#### Visual Indicators:
- **Red background** = Lines deleted (only in left/original)
- **Green background** = Lines added (only in right/modified)
- **Yellow/Orange** = Lines modified (different in both)

#### To Accept Changes:
1. **Look at the colored highlights** to see what changed
2. **Click inside the editor** you want to modify (left or right)
3. **Manually edit** to accept the changes you want
4. **Copy/paste** specific lines between editors as needed

### Method 3: Use the Action Buttons

#### Copy Entire File:
- **Copy Left → Right Button**: Copies all content from original to modified
  - Located in the left panel header (small copy icon)
  - Click to make right = left

- **Copy Right → Left Button**: Copies all content from modified to original
  - Located in the right panel header (small copy icon)
  - Click to make left = right

## 🔧 Advanced Techniques

### Merge Specific Lines
1. Open both files (left and right show diff)
2. See red/green highlights showing differences
3. Find the line you want to merge
4. In the **left editor**, select the line(s) you want
5. Copy (`Ctrl+C`)
6. Click in the **right editor** at the position
7. Paste (`Ctrl+V`)
8. The right editor now has the left's content for those lines

### Accept Only Certain Changes
1. Look at the diff view
2. Green lines = changes in the modified file
3. To accept a green change:
   - It's already in the right side, just keep it
4. To reject a green change:
   - Copy the corresponding line from the left side
   - Paste it into the right side to overwrite

### Combine Changes from Both Sides
1. Open both files
2. Create a new line where you want to merge
3. Copy from left side (`Ctrl+C`)
4. Paste into your merge area
5. Copy from right side
6. Paste below or above
7. Manually adjust as needed

## ⌨️ Keyboard Shortcuts

### Selection:
- **Ctrl+A** - Select all in current editor
- **Shift+Arrow Keys** - Extend selection
- **Ctrl+Shift+L** - Select all occurrences of selection
- **Alt+Click** - Add cursor at clicked position
- **Ctrl+D** - Select next occurrence

### Copy/Paste:
- **Ctrl+C** - Copy selected text
- **Ctrl+X** - Cut selected text
- **Ctrl+V** - Paste
- **Ctrl+Shift+V** - Paste without formatting

### Navigation:
- **Ctrl+G** - Go to line number
- **Ctrl+F** - Find
- **Ctrl+H** - Find and replace
- **F3** / **Shift+F3** - Find next/previous

### Editing:
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl+/** - Toggle comment
- **Shift+Alt+F** - Format document
- **Alt+Up/Down** - Move line up/down
- **Shift+Alt+Up/Down** - Copy line up/down

## 💡 Real-World Examples

### Example 1: Accept One Function from Modified File

**Scenario**: Modified file has updated function, but you want to keep the rest from original.

1. Find the function in the **right editor** (green highlight)
2. Select the entire function (click start, Shift+click end)
3. Copy it (`Ctrl+C`)
4. Click in the **left editor** at the same function location
5. Select the old function
6. Paste (`Ctrl+V`) to replace with new function
7. Now left has the new function, rest is original

### Example 2: Cherry-Pick Lines from Both Files

**Scenario**: You want line 5 from left and line 10 from right.

1. In **left editor**, go to line 5
2. Triple-click to select the line
3. Copy (`Ctrl+C`)
4. In **right editor**, go to line 5
5. Paste (`Ctrl+V`) - now line 5 is from left
6. In **right editor**, line 10 is already there (do nothing)
7. Right editor now has your merged content

### Example 3: Fix Merge Conflicts Manually

**Scenario**: You see both versions, need to combine them.

1. Look at red/green highlights in diff view
2. See what was removed (red) and added (green)
3. In **right editor**, position cursor where you want merged content
4. Copy the red (deleted) lines from **left editor**
5. Paste into **right editor** where they should go
6. Adjust spacing/formatting as needed
7. Right editor now has combined changes

## 🎨 Visual Diff Understanding

### Colors Mean:
- **Red (left side)**: This line exists in original but NOT in modified (deleted)
- **Green (right side)**: This line exists in modified but NOT in original (added)
- **Yellow/Orange**: Line exists in both but content is different (modified)
- **No color**: Line is identical in both files

### Decision Making:
- **Want original version?** Copy from left (red area) to right
- **Want modified version?** Keep right as-is (green area)
- **Want both?** Copy from left, paste in right, keep both lines
- **Want neither?** Delete from both editors

## 🚀 Pro Tips

1. **Use Ctrl+F to find** specific lines quickly
2. **Use Ctrl+G** to jump to line numbers
3. **Click the line number** in the gutter to select entire line
4. **Use Alt+Up/Down** to quickly rearrange lines
5. **Use Ctrl+D** to select next occurrence of selected text
6. **Use multi-cursor** (Alt+Click) to edit multiple places at once
7. **Format code** with Shift+Alt+F after merging

## 📥 Final Steps

After manually merging:
1. **Download** your preferred version using the download buttons
   - **Download Left** - Get the left editor's content
   - **Download Right** - Get the right editor's content
2. Both editors are **fully editable**, so either can be your final result

## 🔄 Comparison with Other Tools

**Traditional Git Merge:**
- Shows conflict markers `<<<<<<<`, `=======`, `>>>>>>>`
- Must manually edit text to resolve
- Hard to visualize

**MergeFlow:**
- Visual red/green highlighting
- Side-by-side comparison
- Direct editing in both panels
- Copy/paste between panels
- No conflict markers needed
- Monaco editor power (same as VS Code)

## ❓ FAQ

**Q: Can I edit both sides?**
A: Yes! Both editors are fully editable.

**Q: How do I copy a single line from left to right?**
A: Select the line in left editor, Ctrl+C, click in right editor, Ctrl+V.

**Q: How do I accept all changes from the right side?**
A: Click the "Copy Right to Left" button in the right panel header, then download from left.

**Q: The colors are confusing. What should I do?**
A: Red = deleted from original, Green = added in modified. Focus on what you want in your final file.

**Q: Can I undo changes?**
A: Yes! Press Ctrl+Z to undo in either editor.

**Q: How do I save my merged result?**
A: Edit until you're happy, then click "Download Left" or "Download Right" to save.

---

**That's it!** You now have full control over line-level merging with MergeFlow. The Monaco DiffEditor gives you VS Code-level power right in the browser.
