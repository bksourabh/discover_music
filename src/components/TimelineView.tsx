import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {PianoNote} from '../utils/pianoNotes';

interface TimelineViewProps {
  notes: PianoNote[];
  noteLength: number;
  totalLength: number;
  highlightedNote?: PianoNote | null;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  notes,
  noteLength,
  totalLength,
  highlightedNote,
}) => {
  if (notes.length === 0) {
    return null;
  }

  // Calculate the width of the timeline container (assuming 100 pixels per second)
  const pixelsPerSecond = 100;
  const timelineWidth = totalLength * pixelsPerSecond;
  const noteWidth = noteLength * pixelsPerSecond;

  // Generate time markers for each second with their positions
  const timeMarkers = [];
  for (let i = 0; i <= Math.ceil(totalLength); i++) {
    timeMarkers.push({
      second: i,
      position: i * pixelsPerSecond,
    });
  }

  // Generate note blocks with their positions
  const noteBlocks = notes.map((note, index) => {
    const startTime = index * noteLength;
    const left = startTime * pixelsPerSecond;
    const isHighlighted = highlightedNote && 
      highlightedNote.name === note.name && 
      highlightedNote.frequency === note.frequency;

    return {
      note,
      startTime,
      left,
      width: noteWidth,
      isHighlighted,
    };
  });

  // Color mapping for different notes (using a simple hash)
  const getNoteColor = (noteName: string, isHighlighted: boolean) => {
    if (isHighlighted) {
      return '#FFD700'; // Gold for highlighted
    }
    
    // Generate a color based on note name
    const hash = noteName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timeline View</Text>
      
      {/* Time markers */}
      <View style={styles.timeMarkersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={[styles.timelineContainer, {width: timelineWidth}]}>
            {/* Time scale markers */}
            <View style={styles.timeScale}>
              {timeMarkers.map((marker) => (
                <View 
                  key={marker.second} 
                  style={[styles.timeMarker, {left: marker.position}]}>
                  <View style={styles.timeMarkerLine} />
                  <Text style={styles.timeMarkerText}>{marker.second}s</Text>
                </View>
              ))}
            </View>

            {/* Note blocks */}
            <View style={styles.notesContainer}>
              {noteBlocks.map((block, index) => (
                <View
                  key={index}
                  style={[
                    styles.noteBlock,
                    {
                      left: block.left,
                      width: block.width,
                      backgroundColor: getNoteColor(block.note.name, block.isHighlighted),
                    },
                    block.isHighlighted && styles.noteBlockHighlighted,
                  ]}>
                  <Text 
                    style={[
                      styles.noteText,
                      block.isHighlighted && styles.noteTextHighlighted,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit>
                    {block.note.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Note Length: {noteLength}s | Total Length: {totalLength}s | Notes: {notes.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  timeMarkersContainer: {
    maxHeight: 200,
  },
  timelineContainer: {
    position: 'relative',
    minHeight: 120,
    paddingTop: 30,
  },
  timeScale: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  timeMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeMarkerLine: {
    width: 2,
    height: 10,
    backgroundColor: '#333',
  },
  timeMarkerText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  notesContainer: {
    position: 'relative',
    marginTop: 10,
    minHeight: 60,
  },
  noteBlock: {
    position: 'absolute',
    height: 50,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  noteBlockHighlighted: {
    borderWidth: 3,
    borderColor: '#FF6B00',
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  noteText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  noteTextHighlighted: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  legend: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default TimelineView;

