import React, { useState } from 'react';
import { Text, View, TextInput, ScrollView, StyleSheet } from 'react-native';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfFiles, setPdfFiles] = useState([
    'FluShield Plus',
    'ImmuGuard',
    'ViraSafe',
    'ProVax',
    'HealthGuard'
  ]);

  return (
    <View style={{ flex: 1 }}>
      {/* Search Area */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {/* PDF List */}
      <View style={styles.listContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {pdfFiles.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Text style={styles.fileText}>{file}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  listContainer: {
    flex: 1,
    padding: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  fileItem: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  fileText: {
    fontSize: 18,
  },
});
