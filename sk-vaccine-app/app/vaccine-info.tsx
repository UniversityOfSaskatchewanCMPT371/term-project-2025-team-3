import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');

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

      {/* Vaccine Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Vaccine Info</Text>
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
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  infoText: {
    fontSize: 24,
    textAlign: 'center',
  },
});
