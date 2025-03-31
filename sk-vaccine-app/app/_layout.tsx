import "reflect-metadata";
import { Stack } from "expo-router";
import { Image, View, Text, StyleSheet } from "react-native";
import { JSXElementConstructor, memo, useEffect } from "react";
import React from "react";
import SettingsButton from "@/components/settings-btn";
import VaccineDataController from "@/controllers/vaccineDataController";
import { VaccineDataService } from "@/services/vaccineDataService";
import { useUpdateVaccineSheets } from "@/hooks/vaccineData";
import logger from "@/utils/logger";
import settingsButton from "@/components/settings-btn";
import { ScreenHeight } from "react-native-elements/dist/helpers";

const CustomHeader = memo(() => {
  /**
   * @postcondition the header should contain the logo and the text properly
   */
  return (
    <View style={styles.headerContainer}>
      <SettingsButton />
    </View>
  );
});

/**
 * header of the application
 * @param {VaccineDataController } vaccineController - must be properley defined
 * @param  {VaccineDataService} VaccineDataService -must be properley defined
 * @param {Function} useUpdateVaccineSheets -must return a valid value
 * @returns {JSXElement}
 * -The header should contains both title and settingButton
 * -updateResult should have been logged using logger.info without error
 * -Stack components properly rendered without crashing
 */
export default function RootLayout() {
  const vaccineController = new VaccineDataController(new VaccineDataService());
  const updateResult = useUpdateVaccineSheets(vaccineController);
  logger.info(updateResult);
  console.assert(
    updateResult != null && updateResult != undefined,
    "updated result cannot be null or undefined"
  );
  console.assert(
    typeof SettingsButton == "function" && typeof CustomHeader == "function",
    "must be valid component"
  );
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false, // Hides the bottom shadow
        headerTransparent: true, // Makes the header background transparent
        headerStyle: {
          backgroundColor: "transparent", // Ensures transparency
        },
        headerRight: () => <CustomHeader />,
        headerTitle: "", // Memoize the header, supposed to prevent updates but I am unsure about that
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: "center",
    marginRight: 20,
    flex: 1,
    
  },
  headerStyle: {
    backgroundColor: "#fff",
    shadowColor: "#000",
  },
});
