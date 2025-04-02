import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { memo } from "react";
import React from "react";
import { RFPercentage } from "react-native-responsive-fontsize";
import assert from "assert";
import { VaccineSheet } from "@/interfaces/iVaccineData";

export default function DisplayVaccineLayout() {
  const { data } = useLocalSearchParams<{ data: string }>();
  assert(data, "No data given to DisplayVaccine page in routing parameters");
  const parsedData = JSON.parse(data);
  const pageData: VaccineSheet = parsedData;
  return (
    <Stack
      screenOptions={{
        headerTitle: () => <Text style={styles.headerTitle}>{pageData.vaccineName}</Text>,
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
    fontSize: RFPercentage(3.5), // Increase the text size
    marginRight: 10,
    fontFamily: "MYRIADPRO-REGULAR",
    textAlign: "center",
  },
});
