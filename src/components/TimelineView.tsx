import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {PianoNote} from '../utils/pianoNotes';

interface TimelineViewProps {
  notes: PianoNote[];
  noteLength: number;
  totalLength: number;
  highlightedNote?: PianoNote | null;
  instrumentName?: string; // Optional instrument name, defaults to "Piano"
  placeholders?: (PianoNote | null)[]; // Optional array of notes and placeholders for user-generated mode
  currentPlaybackTime?: number; // Current playback time in seconds for progress indicator
}

interface SwimLane {
  id: string;
  label: string;
  notes: Array<{
    note: PianoNote | null; // null indicates a placeholder
    startTime: number;
    left: number;
    width: number;
    isHighlighted: boolean;
    isPlaceholder: boolean;
  }>;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  notes,
  noteLength,
  totalLength,
  highlightedNote,
  instrumentName = 'Piano',
  placeholders,
  currentPlaybackTime,
}) => {
  // Get screen dimensions for responsive design
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const isMobile = screenData.width < 768;

  // Use placeholders if provided (user-generated mode), otherwise use notes
  const displayItems = placeholders || notes.map(note => note as PianoNote | null);
  
  if (displayItems.length === 0) {
    return null;
  }

  // Calculate the width of the timeline container (responsive pixels per second)
  const pixelsPerSecond = isMobile ? 60 : 100;
  const timelineWidth = totalLength * pixelsPerSecond;
  const noteWidth = noteLength * pixelsPerSecond;
  const laneHeight = isMobile ? 45 : 60;
  
  // Calculate progress indicator position
  const progressPosition = currentPlaybackTime !== undefined && currentPlaybackTime >= 0
    ? Math.min(currentPlaybackTime * pixelsPerSecond, timelineWidth)
    : undefined;

  // Generate time markers for each second with their positions
  const timeMarkers = [];
  for (let i = 0; i <= Math.ceil(totalLength); i++) {
    timeMarkers.push({
      second: i,
      position: i * pixelsPerSecond,
    });
  }

  // Create note blocks for the first lane (all notes go here, including placeholders)
  const noteBlocks = displayItems.map((item, index) => {
    const startTime = index * noteLength;
    const left = startTime * pixelsPerSecond;
    const isPlaceholder = item === null;
    const isHighlighted = !isPlaceholder && highlightedNote && 
      highlightedNote.name === item.name && 
      highlightedNote.frequency === item.frequency;

    return {
      note: item,
      startTime,
      left,
      width: noteWidth,
      isHighlighted,
      isPlaceholder,
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
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <Text style={[styles.title, isMobile && styles.titleMobile]}>Timeline View</Text>
      
      {/* Time markers and swimlanes */}
      <View style={styles.timeMarkersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={[
            styles.timelineContainer, 
            isMobile && styles.timelineContainerMobile,
            {
              width: (isMobile ? 60 : 100) + timelineWidth, // Add space for lane labels
              minHeight: swimLanes.length * laneHeight + (isMobile ? 30 : 40),
            }
          ]}>
            {/* Time scale markers */}
            <View style={[
              styles.timeScale,
              isMobile && styles.timeScaleMobile,
            ]}>
              {timeMarkers.map((marker) => (
                  <View 
                    key={marker.second} 
                    style={[styles.timeMarker, {left: marker.position}]}>
                    <View style={styles.timeMarkerLine} />
                    <Text style={[styles.timeMarkerText, isMobile && styles.timeMarkerTextMobile]}>{marker.second}s</Text>
                  </View>
              ))}
            </View>

            {/* Progress Indicator */}
            {progressPosition !== undefined && (
              <View
                style={[
                  styles.progressIndicator,
                  isMobile && styles.progressIndicatorMobile,
                  {
                    left: (isMobile ? 60 : 100) + progressPosition,
                    top: isMobile ? 25 : 30,
                    height: swimLanes.length * laneHeight,
                  },
                ]}
              />
            )}

            {/* Swimlanes */}
            <View style={styles.swimlanesContainer}>
              {swimLanes.map((lane, laneIndex) => (
                <View 
                  key={lane.id} 
                  style={[
                    styles.swimlane,
                    isMobile && styles.swimlaneMobile,
                    {
                      top: laneIndex * laneHeight + (isMobile ? 25 : 30),
                      height: laneHeight,
                    },
                  ]}>
                  {/* Lane label */}
                  <View style={[
                    styles.laneLabel,
                    isMobile && styles.laneLabelMobile,
                  ]}>
                    <Text style={[styles.laneLabelText, isMobile && styles.laneLabelTextMobile]}>{lane.label}</Text>
                  </View>
                  
                  {/* Lane content with notes */}
                  <View style={styles.laneContent}>
                    {lane.notes.map((block, noteIndex) => {
                      if (block.isPlaceholder) {
                        // Render placeholder block
                        return (
                          <View
                            key={`${lane.id}-note-${noteIndex}`}
                            style={[
                              styles.noteBlock,
                              styles.noteBlockPlaceholder,
                              isMobile && styles.noteBlockMobile,
                              {
                                left: block.left,
                                width: block.width,
                                height: isMobile ? 35 : 45,
                              },
                            ]}>
                            <Text 
                              style={[
                                styles.noteText,
                                styles.noteTextPlaceholder,
                                isMobile && styles.noteTextMobile,
                              ]}
                              numberOfLines={1}
                              adjustsFontSizeToFit>
                              ?
                            </Text>
                          </View>
                        );
                      }
                      
                      // Render filled note block
                      return (
                        <View
                          key={`${lane.id}-note-${noteIndex}`}
                          style={[
                            styles.noteBlock,
                            isMobile && styles.noteBlockMobile,
                            {
                              left: block.left,
                              width: block.width,
                              backgroundColor: getNoteColor(block.note!.name, block.isHighlighted),
                              height: isMobile ? 35 : 45,
                            },
                            block.isHighlighted && styles.noteBlockHighlighted,
                          ]}>
                          <Text 
                            style={[
                              styles.noteText,
                              isMobile && styles.noteTextMobile,
                              block.isHighlighted && styles.noteTextHighlighted,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit>
                            {block.note!.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendText, isMobile && styles.legendTextMobile]}>
          {isMobile ? (
            placeholders 
              ? `Length: ${noteLength}s / ${totalLength}s | ${placeholders.filter(n => n !== null).length}/${placeholders.length} filled`
              : `Length: ${noteLength}s / ${totalLength}s | Notes: ${notes.length}`
          ) : (
            placeholders
              ? `Note Length: ${noteLength}s | Total Length: ${totalLength}s | ${placeholders.filter(n => n !== null).length}/${placeholders.length} filled | Lanes: ${swimLanes.length}`
              : `Note Length: ${noteLength}s | Total Length: ${totalLength}s | Notes: ${notes.length} | Lanes: ${swimLanes.length}`
          )}
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
  containerMobile: {
    marginVertical: 12,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  titleMobile: {
    fontSize: 16,
    marginBottom: 10,
  },
  timeMarkersContainer: {
    maxHeight: 500,
  },
  timelineContainer: {
    position: 'relative',
    paddingTop: 30,
    paddingLeft: 0, // No padding - we'll position elements absolutely
  },
  timelineContainerMobile: {
    paddingTop: 25,
    paddingLeft: 0,
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
  timeScaleMobile: {
    left: 60,
    height: 25,
    borderBottomWidth: 1.5,
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
  timeMarkerTextMobile: {
    fontSize: 8,
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
  swimlaneMobile: {
    left: 60,
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
  laneLabelMobile: {
    left: -60,
    width: 55,
    paddingHorizontal: 3,
  },
  laneLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  laneLabelTextMobile: {
    fontSize: 10,
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
  noteBlockMobile: {
    height: 35,
    top: 3,
    borderRadius: 3,
    paddingHorizontal: 2,
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
  noteTextMobile: {
    fontSize: 8,
  },
  noteTextHighlighted: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  noteBlockPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#999',
  },
  noteTextPlaceholder: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
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
  legendTextMobile: {
    fontSize: 10,
  },
  progressIndicator: {
    position: 'absolute',
    top: 30,
    width: 3,
    backgroundColor: '#FF0000',
    zIndex: 100,
    shadowColor: '#FF0000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 10,
  },
  progressIndicatorMobile: {
    top: 25,
    width: 2,
  },
});

export default TimelineView;

