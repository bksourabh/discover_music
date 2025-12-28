import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {PianoNote} from '../utils/pianoNotes';

interface TimelineViewProps {
  notes: PianoNote[];
  noteLength: number;
  totalLength: number;
  highlightedNote?: PianoNote | null;
  instrumentName?: string; // Optional instrument name, defaults to "Piano"
}

interface SwimLane {
  id: string;
  label: string;
  notes: Array<{
    note: PianoNote;
    startTime: number;
    left: number;
    width: number;
    isHighlighted: boolean;
  }>;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  notes,
  noteLength,
  totalLength,
  highlightedNote,
  instrumentName = 'Piano',
}) => {
  if (notes.length === 0) {
    return null;
  }

  // Calculate the width of the timeline container (assuming 100 pixels per second)
  const pixelsPerSecond = 100;
  const timelineWidth = totalLength * pixelsPerSecond;
  const noteWidth = noteLength * pixelsPerSecond;
  const laneHeight = 60;

  // Generate time markers for each second with their positions
  const timeMarkers = [];
  for (let i = 0; i <= Math.ceil(totalLength); i++) {
    timeMarkers.push({
      second: i,
      position: i * pixelsPerSecond,
    });
  }

  // Create note blocks for the first lane (all notes go here)
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

  // Create swimlanes: first lane has all notes, others are placeholders
  const numPlaceholderLanes = 2; // Number of empty placeholder lanes
  const swimLanes: SwimLane[] = [];
  
  // First lane with all actual notes
  swimLanes.push({
    id: 'lane-1',
    label: `${instrumentName} Sample 1`,
    notes: noteBlocks,
  });

  // Create placeholder lanes (empty)
  for (let i = 0; i < numPlaceholderLanes; i++) {
    swimLanes.push({
      id: `lane-placeholder-${i + 2}`,
      label: `${instrumentName} Sample ${i + 2}`,
      notes: [], // Empty placeholder
    });
  }

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
      
      {/* Time markers and swimlanes */}
      <View style={styles.timeMarkersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={[
            styles.timelineContainer, 
            {
              width: timelineWidth,
              minHeight: swimLanes.length * laneHeight + 40,
            }
          ]}>
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

            {/* Swimlanes */}
            <View style={styles.swimlanesContainer}>
              {swimLanes.map((lane, laneIndex) => (
                <View 
                  key={lane.id} 
                  style={[
                    styles.swimlane,
                    {
                      top: laneIndex * laneHeight + 30,
                      height: laneHeight,
                    },
                  ]}>
                  {/* Lane label */}
                  <View style={styles.laneLabel}>
                    <Text style={styles.laneLabelText}>{lane.label}</Text>
                  </View>
                  
                  {/* Lane content with notes */}
                  <View style={styles.laneContent}>
                    {lane.notes.map((block, noteIndex) => (
                      <View
                        key={`${lane.id}-note-${noteIndex}`}
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
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Note Length: {noteLength}s | Total Length: {totalLength}s | Notes: {notes.length} | Lanes: {swimLanes.length}
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
    maxHeight: 500,
  },
  timelineContainer: {
    position: 'relative',
    paddingTop: 30,
    paddingLeft: 100, // Space for lane labels
  },
  timeScale: {
    position: 'absolute',
    top: 0,
    left: 100, // Start after lane labels
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
  swimlanesContainer: {
    position: 'relative',
    marginTop: 10,
  },
  swimlane: {
    position: 'absolute',
    left: 100, // Start after lane labels
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
  },
  laneLabel: {
    position: 'absolute',
    left: -100,
    width: 95,
    height: '100%',
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  laneLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  laneContent: {
    position: 'relative',
    flex: 1,
    height: '100%',
  },
  noteBlock: {
    position: 'absolute',
    height: 45,
    top: 5,
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

