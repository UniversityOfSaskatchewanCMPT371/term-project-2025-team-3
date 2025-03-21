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
  const saskLogo = require("@/assets/images/NursingLogo.webp");
  /**
   * Preconditions: Image file (NursingLogo.webp) must be exist in the directory.
   * Postcondition: the header should contain the logo and the text properly
   */
  return (
    <View
      style = {styles.headerContainer}
    >
      <Image
        source={saskLogo}
        style={styles.logo}
      />
      <Text style = {styles.headerTitle}>Sask</Text>
      {/* <View style={{alignItems: "flex-start" }}>
        <Text style={{ fontSize: 15, lineHeight: 20, marginTop: 60, justifyContent: 'center', alignContent: 'center'}}>
          Sask Vaccine Guide
        </Text>
      </View> */}
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
        headerStyle: styles.headerStyle,
        headerTitle: () => <CustomHeader />, // Memoize the header, supposed to prevent updates but I am unsure about that
        headerTitleAlign: "center",
      }}
    />
  );
}


const styles = StyleSheet.create({
  headerContainer:{
    position: 'absolute',
    top:0,
    right:0,
    left:0,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 5,
    height: ScreenHeight/8,
    width: '100%',

  },
  logo: {
    width: 250,
    height: 70,
    resizeMode: 'contain',
    margin: 5,
  },
  headerTitle: {
    fontFamily: 'MYRIADPRO-REGULAR',
    fontSize: 16,
    fontWeight: "600",
    color: "#333", 
    marginTop: -5,
    textAlign: 'center'
    
  },
  headerStyle: {
    backgroundColor: '#fff',
    shadowColor: '#000',

  },
})