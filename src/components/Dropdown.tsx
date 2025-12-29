import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onValueChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({label, value, options, onValueChange}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const isMobile = screenData.width < 768;
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setModalVisible(false);
  };

  // Use modal-based dropdown for both web and native
  return (
    <View style={styles.container}>
      <Text style={[styles.label, isMobile && styles.labelMobile]}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, isMobile && styles.dropdownMobile]}
        onPress={() => setModalVisible(true)}>
        <Text style={[styles.dropdownText, isMobile && styles.dropdownTextMobile]}>{selectedOption.label}</Text>
        <Text style={[styles.arrow, isMobile && styles.arrowMobile]}>▼</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, isMobile && styles.modalContentMobile]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, isMobile && styles.modalTitleMobile]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    isMobile && styles.optionMobile,
                    item.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.value)}>
                  <Text
                    style={[
                      styles.optionText,
                      isMobile && styles.optionTextMobile,
                      item.value === value && styles.selectedOptionText,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  labelMobile: {
    fontSize: 14,
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dropdownMobile: {
    padding: 10,
    minHeight: 44,
    borderRadius: 6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownTextMobile: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  arrowMobile: {
    fontSize: 10,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalContentMobile: {
    width: '90%',
    maxWidth: '90%',
    padding: 16,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalTitleMobile: {
    fontSize: 16,
    marginBottom: 12,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 44,
  },
  optionMobile: {
    padding: 12,
    minHeight: 44,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextMobile: {
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#1976d2',
    fontWeight: '600',
  },
});

export default Dropdown;

