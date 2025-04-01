import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { memo } from "react";
import React from "react";
import { RFPercentage } from "react-native-responsive-fontsize";



export default function ClinicInfoLayout() {
  return (
    <Stack
  screenOptions={{
    headerTitle: () => <Text style={styles.headerTitle} >Clinic List</Text>,
    headerTitleAlign: "center", // Centers the title
    headerRight: () => null, // Fully remove inherited SettingsButton
    headerBackVisible: true,
  }}
/>
  );
}

const styles = StyleSheet.create({
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    headerTitle: {
        fontSize: RFPercentage(4), // Increase the text size
        fontFamily: "MYRIADPRO-REGULAR",
    },
  });