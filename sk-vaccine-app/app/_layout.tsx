import "reflect-metadata";
import { Stack } from "expo-router";
import { Image, View, Text } from "react-native";
import { JSXElementConstructor, memo, useEffect } from "react";
import React from "react";
import SettingsButton from "@/components/settings-btn";
import VaccineDataController from "@/controllers/vaccineDataController";
import { VaccineDataService } from "@/services/vaccineDataService";
import { useUpdateVaccineSheets } from "@/hooks/vaccineData";
import logger from "@/utils/logger";
import settingsButton from "@/components/settings-btn";

const CustomHeader = memo(() => {
  const TITLE_TEXT = "Sask\nImmunize";
  const saskLogo = require("@/assets/images/sasklogo-tra.png");

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 5,
      }}
    >
      <Image
        source={saskLogo}
        style={{ width: 70, height: 100, resizeMode: "contain" }}
      />
      <View style={{ alignItems: "flex-start" }}>
        <Text style={{ fontSize: 25, lineHeight: 28 }}>College of Nursing</Text>
        <Text style={{ fontSize: 38, lineHeight: 38, marginTop: -3 }}>
          Immunize
        </Text>
      </View>
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
  console.assert(updateResult != null && updateResult !=undefined, 'updated result cannot be null or undefined');
  console.assert(typeof SettingsButton=='function' && typeof CustomHeader=='function', 'must be valid component');
  return (
    <Stack
      screenOptions={{
        headerRight: () => <SettingsButton />,
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitle: () => <CustomHeader />, // Memoize the header, supposed to prevent updates but I am unsure about that
        
        headerTitleAlign: "center",
        
      }}
    />
  );
}
