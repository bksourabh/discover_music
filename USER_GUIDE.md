# Discover Music - User Guide

Welcome to Discover Music! This guide will help you learn how to use the app to generate, play, and manage piano note sequences.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Interface](#understanding-the-interface)
3. [Generating Notes](#generating-notes)
4. [Playing Sequences](#playing-sequences)
5. [Editing Notes](#editing-notes)
6. [Range Mode](#range-mode)
7. [Note Filters](#note-filters)
8. [Saving and Loading Sequences](#saving-and-loading-sequences)
9. [Exporting and Importing CSV](#exporting-and-importing-csv)
10. [Timeline View](#timeline-view)
11. [Tips and Tricks](#tips-and-tricks)
12. [Troubleshooting](#troubleshooting)

## Getting Started

### First Launch

When you first open the app, you'll see:
- A welcome message with your name
- Two dropdown menus for configuring your sequence
- A piano keyboard showing all 88 keys (A0 to C8)
- Various buttons and controls

### Quick Start

1. **Set your preferences:**
   - Choose **Note Length** (how long each note plays): 0.1 to 2.0 seconds
   - Choose **Total Length** (total duration of the sequence): 5 to 15 seconds

2. **Click "Generate"** to create a random sequence of piano notes

3. **Click "Play"** to hear your sequence

That's it! You've created and played your first piano sequence.

## Understanding the Interface

### Main Controls

- **Note Length Dropdown**: Controls how long each individual note plays (0.1s to 2.0s)
- **Total Length Dropdown**: Controls the total duration of the entire sequence (5s to 15s)
- **Generation Mode**: Choose between "Auto Generate" or "User Generated"
- **Piano Keyboard**: Visual representation of all 88 piano keys - click keys to interact
- **Generate Button**: Creates a new sequence based on your settings
- **Play Button**: Plays the current sequence
- **Export Notes to CSV**: Downloads your sequence as a CSV file
- **Upload Notes CSV**: Loads a sequence from a CSV file
- **Restore to Default**: Resets all settings to default values

### Note Display

After generating notes, you'll see:
- A list of note buttons showing each note in the sequence (e.g., "C4", "D#5", "F3")
- A timeline visualization showing when each note plays
- Information about how many notes were generated

## Generating Notes

### Auto Generate Mode (Default)

This is the easiest way to create sequences:

1. **Set your preferences:**
   - Note Length: How long each note plays
   - Total Length: Total duration of sequence
   - (Optional) Enable Range Mode to limit note selection
   - (Optional) Toggle Sharps/Flats filters

2. **Click "Generate"**
   - The app will automatically create random notes
   - Notes appear progressively as they're generated
   - The sequence automatically plays when generation completes

3. **Review your sequence:**
   - See all notes in the note list
   - View the timeline visualization
   - Click any note to edit it

### User Generated Mode

Create sequences by manually selecting notes:

1. **Switch to "User Generated" mode** using the mode selector buttons

2. **Click "Generate"** to create empty placeholders
   - The number of placeholders depends on your Note Length and Total Length settings
   - Placeholders appear as gray boxes with "?" marks

3. **Fill the placeholders:**
   - Click piano keys to fill empty slots
   - Each key press fills the next empty placeholder
   - The note plays briefly when you click it
   - Continue until all placeholders are filled

4. **Edit notes:**
   - Click any filled note to edit it
   - Type a new note name (e.g., "C4", "D#5")
   - Press Enter or click away to save

**Note:** Range Mode and Sharps/Flats filters are disabled in User Generated mode.

## Playing Sequences

### Playing a Sequence

1. **Make sure you have notes:**
   - Generate a sequence, or
   - Load a recent sequence, or
   - Upload a CSV file

2. **Click "Play"**
   - The sequence plays from start to finish
   - Notes are highlighted on the piano keyboard as they play
   - The timeline shows playback progress
   - The Play button shows a loading indicator while playing

### During Playback

- **Piano keys light up** as their notes play
- **Timeline progress** shows where you are in the sequence
- **Note buttons** may be highlighted to show the current note
- You cannot generate or edit notes while playing

### Stopping Playback

- Playback automatically stops when the sequence ends
- If you need to stop early, wait for the current note to finish (playback cannot be interrupted mid-note)

## Editing Notes

### Editing Individual Notes

1. **Click any note button** in the note list
   - The note becomes an editable text field
   - The note name is pre-filled

2. **Type a new note name:**
   - Use standard notation: "C4", "D#5", "Bb3", etc.
   - Must be a valid piano note (A0 to C8)
   - Use # for sharps, b for flats

3. **Press Enter or click away** to save
   - Valid notes are saved immediately
   - Invalid notes show an error and revert after 1.5 seconds

### Valid Note Formats

- Natural notes: `C4`, `D5`, `E3`, `F6`, `G2`, `A1`, `B7`
- Sharps: `C#4`, `D#5`, `F#3`, `G#6`, `A#2`
- Flats: `Db4`, `Eb5`, `Gb3`, `Ab6`, `Bb2`
- Range: A0 (lowest) to C8 (highest)

### Editing Tips

- **Hover over notes** on the piano keyboard to see which note you're editing
- **Click piano keys** to hear notes before editing
- **Invalid notes** will show an error message and revert automatically

## Range Mode

Range Mode lets you limit note generation to a specific range of the piano.

### Enabling Range Mode

1. **Toggle "Select Piano Generation Range Mode"** switch to ON
   - This option is only available in Auto Generate mode

2. **Select the minimum key:**
   - Click a key on the piano keyboard
   - This becomes your minimum note

3. **Select the maximum key:**
   - Click a higher key on the piano keyboard
   - Must be higher than the minimum key
   - This becomes your maximum note

### Using Range Mode

- **Generate notes** - only notes within your selected range will be used
- **Range is shown** in the info box below the switch
- **To change range:** Click a new minimum key, then a new maximum key
- **To disable:** Toggle the switch OFF

### Range Mode Tips

- Use Range Mode to focus on specific octaves (e.g., middle C range: C4 to C5)
- Great for creating melodies in a specific register
- Range selection is cleared when you disable Range Mode

## Note Filters

Control which types of notes can be generated:

### Use Sharps (Black Keys)

- **ON (default)**: Black keys (sharps/flats) can be included
- **OFF**: Only white keys (natural notes) will be generated
- **Note:** At least one filter must be enabled

### Use Flats (White Keys)

- **ON (default)**: White keys (natural notes) can be included
- **OFF**: Only black keys (sharps/flats) will be generated
- **Note:** At least one filter must be enabled

### Filter Combinations

- **Both ON**: All notes (default)
- **Sharps ON, Flats OFF**: Only black keys (C#, D#, F#, G#, A#)
- **Sharps OFF, Flats ON**: Only white keys (C, D, E, F, G, A, B)
- **Both OFF**: Not allowed (at least one must be ON)

**Note:** Filters only apply to Auto Generate mode. User Generated mode allows all notes.

## Saving and Loading Sequences

### Automatic Saving

- **Recent sequences are automatically saved** when you generate or play a sequence
- The app remembers your **last 3 sequences**
- Older sequences are automatically removed when new ones are added

### Loading Recent Sequences

1. **Scroll down** to the "Recent Sequences" section
2. **Click on a sequence** to load it
   - The sequence loads into the note list
   - Note Length and Total Length are updated
   - The sequence automatically plays after loading

### Recent Sequence Information

Each recent sequence shows:
- **Sequence number** (1, 2, or 3)
- **Note length** and **total length**
- **Date and time** when it was created
- **Export button** to download as CSV

### Exporting Recent Sequences

- Click the **"Export to CSV"** button next to any recent sequence
- The CSV file downloads immediately
- Use this to save sequences permanently or share them

## Exporting and Importing CSV

### Exporting to CSV

1. **Generate or load a sequence**
2. **Click "Export Notes to CSV"**
3. **File downloads automatically** (web) or shows in console (native apps)

**CSV Format:**
- Headers: Index, Note Name, Frequency (Hz), Octave, Note Length (s), Timestamp (s)
- One row per note
- Can be opened in Excel, Google Sheets, or any text editor

### Importing from CSV

1. **Click "Upload Notes CSV"**
2. **Select your CSV file**
3. **Sequence loads automatically:**
   - Notes appear in the note list
   - Note Length and Total Length are set from the file
   - Sequence automatically plays after loading

**CSV Requirements:**
- Must have "Note Name" and "Note Length (s)" columns
- Note names must be valid piano notes (A0 to C8)
- Optional: "Frequency (Hz)" and "Octave" columns for better matching

**Note:** CSV import/export is currently only available on the web version.

## Timeline View

The timeline visualization shows your sequence visually:

### Understanding the Timeline

- **Horizontal bars** represent each note
- **Bar length** shows how long each note plays
- **Bar position** shows when the note plays in the sequence
- **Highlighted bars** show the currently playing note during playback
- **Placeholder markers** (in User Generated mode) show empty slots

### Timeline Features

- **Visual feedback** during playback
- **Easy to see** note durations and timing
- **Helps understand** the overall structure of your sequence

## Tips and Tricks

### Creating Melodies

1. **Use Range Mode** to focus on a specific octave (e.g., C4-C5 for melodies)
2. **Set shorter note lengths** (0.2-0.4s) for faster melodies
3. **Use User Generated mode** for complete control over each note

### Creating Chords and Harmonies

1. **Use longer note lengths** (0.5-1.0s) to hear harmonies
2. **Edit notes manually** to create specific chord progressions
3. **Experiment with different ranges** to find pleasing combinations

### Experimenting with Timing

1. **Short notes (0.1-0.3s)**: Fast, staccato sequences
2. **Medium notes (0.3-0.7s)**: Balanced, flowing sequences
3. **Long notes (0.7-2.0s)**: Slow, sustained sequences

### Workflow Tips

1. **Generate multiple sequences** and compare them
2. **Edit interesting sequences** to refine them
3. **Export favorites** to CSV for backup
4. **Use Recent Sequences** to quickly switch between ideas
5. **Combine Range Mode and filters** for specific musical styles

### Keyboard Shortcuts

- **Click piano keys** to hear individual notes
- **Hover over notes** in the list to see them highlighted on the keyboard
- **Click and hold** note buttons to see them on the keyboard

## Troubleshooting

### Notes Won't Play

**On Web:**
- Check your browser's audio settings
- Make sure your device volume is not muted
- Try refreshing the page
- Check browser console for errors

**On Mobile:**
- Check device volume
- Make sure the app has audio permissions
- Try restarting the app

### Can't Generate Notes

- **Make sure Note Length and Total Length are set** (they have default values)
- **Check Range Mode:** If enabled, make sure you've selected both min and max keys
- **Check filters:** At least one of "Use Sharps" or "Use Flats" must be enabled
- **Try "Restore to Default"** to reset all settings

### Notes Look Wrong

- **Check the note format:** Must be valid (e.g., "C4", "D#5", "Bb3")
- **Invalid notes show an error** and revert automatically
- **Make sure you're using the correct octave** (0-8)

### Can't Edit Notes

- **In User Generated mode:** Click piano keys to fill placeholders, then click filled notes to edit
- **In Auto Generate mode:** Click any note button to edit it
- **Placeholders (?) cannot be edited** - fill them first by clicking piano keys

### Recent Sequences Not Showing

- **Only the last 3 sequences are saved** - older ones are automatically removed
- **Generate or play a sequence** to save it to recent sequences
- **On web:** Check that localStorage is enabled in your browser

### CSV Export/Import Not Working

- **CSV features are only available on web** - use the web version for CSV functionality
- **Check file format:** Must have "Note Name" and "Note Length (s)" columns
- **Make sure note names are valid** (A0 to C8)

### App Feels Slow

- **Large sequences** (long total length with short note length) may take longer to generate
- **Progressive generation** shows notes appearing one by one - this is normal
- **Try shorter sequences** or longer note lengths for faster generation

### Need Help?

- Check this guide for detailed instructions
- Try "Restore to Default" to reset all settings
- Make sure you're using a supported browser (for web) or the latest app version (for mobile)

---

## Quick Reference

### Default Settings
- **Note Length:** 0.3 seconds
- **Total Length:** 7 seconds
- **Generation Mode:** Auto Generate
- **Range Mode:** Off
- **Use Sharps:** On
- **Use Flats:** On

### Valid Note Range
- **Lowest:** A0 (27.5 Hz)
- **Highest:** C8 (4186 Hz)
- **Total Keys:** 88 keys

### Button Colors
- **Green:** Generate
- **Blue:** Play
- **Orange:** Export CSV
- **Purple:** Upload CSV
- **Gray:** Restore to Default
- **Red:** Logout

---

Enjoy creating music with Discover Music! 🎹🎵

