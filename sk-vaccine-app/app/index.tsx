import SquareButton from "@/components/home-square-btn";
import { StyleSheet, Text, View, Image, ScrollView } from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import fontConf from "react-native.config.js";
import ClinicData from "@/services/clinicDataService";
import useClinicData from "@/hooks/clinicData";
import LocationData from "@/services/locationDataService";
import { useDayParts, useWelcomeFact } from "@/hooks/welcomeData";
// eslint-disable-next-line
import logger from "@/utils/logger";
import { Redirect, useNavigation } from "expo-router";
import { useEffect } from "react";
import {
  PATH_VACCINE_INFO,
  PATH_CLINIC_INFO,
  PATH_CLOSEST_CLINIC,
  PATH_HOME,
  PATH_DISPLAY_CLINIC,
} from "../utils/constPaths";
import React from "react";
import ClosestClincButton from "@/components/closest-clinic-btn";
import SettingsButton from "@/components/settings-btn";
import { WelcomeFactController } from "@/controllers/welcomeFactController";

export const CLINIC_BTN_TEXT = "Clinic Info";
export const BOOKING_BTN_TEXT = "Booking";
export const RECORDS_BTN_TEXT = "My Records";
export const VACCINE_BTN_TEXT = "Vaccine Info";
const URL = process.env.EXPO_PUBLIC_CLINIC_LIST_URL;

/**
 * The home screen of the Sask Immunize app.
 * 
 * This screen provides navigation to various sections of the app, including vaccine information, 
 * clinic details, and personal records. It features a logo, title, and multiple navigation buttons.
 * 
 * @component
 * @returns {JSX.Element} - The rendered home screen component.
 
 */
export default function Index() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ headerShown: true });
  }, [navigation]);

  const welcomeFact = useWelcomeFact(new WelcomeFactController());

  const timeOfDayText = useDayParts();

  // get closest clinic
  const { clinicArray, loading, serverAccessFailed, error } = useClinicData({
    clinicService: new ClinicData(),
    url: URL,
    sortByDistance: true,
    locationService: new LocationData(),
  });

  let closestClinicButton;

  if (error) {
    logger.error("Closest clinic failed to load");
    closestClinicButton = <ClosestClincButton clinicName="Unavailable" />;
  } else if (!loading) {
    const filteredClinics =
      clinicArray?.clinics.filter(
        (clinic) =>
          Array.isArray(clinic.services) &&
          clinic.services.some((service) =>
            service.toLowerCase().includes("child")
          )
      ) || [];

    const closestClinic = filteredClinics[0];
    closestClinicButton = (
      <ClosestClincButton
        href={{
          pathname: PATH_DISPLAY_CLINIC as any,
          params: { data: JSON.stringify(closestClinic) },
        }}
        hours={closestClinic.hours}
        clinicName={closestClinic.name}
        address={closestClinic.address}
      />
    );
  } else {
    closestClinicButton = <ClosestClincButton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.minionProBold}>Good {timeOfDayText},</Text>
          <Text style={styles.myriadProRegular}>Did you know that</Text>
          <Text style={styles.myriadProRegular}>{welcomeFact}</Text>
        </View>
        <View style={styles.horizontalContainer}>{closestClinicButton}</View>
        <View style={styles.horizontalContainer}>
          <View style={styles.btnContainer}>
            <SquareButton
              path={PATH_CLINIC_INFO}
              text={CLINIC_BTN_TEXT}
              style={{ backgroundColor: "#a3caba" }}
            />
          </View>
          <View style={styles.btnContainer}>
            <SquareButton
              path={PATH_VACCINE_INFO}
              text={VACCINE_BTN_TEXT}
              style={{ backgroundColor: "#C2DAD0" }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// I just added Pre and Post Condition for the fonts
/**
 * @precondition the fonts myriadProRegular and minionProBold must be available in './asserts/fonts'
 * @precondition react-native.config.js file - must be correctly configured to load fonts
 * @postcondition fonts must desplyed as desired fonts
 * @postcondition myriadProRegular must be correctly centerilized
 */

// assert react-native.config.js file is currectly configured

console.assert(
  fontConf.assets.includes("./assets/fonts"),
  "fonts are not configured correctly"
);

const styles = StyleSheet.create({
  scrollContainer: {
    flexShrink: 1, // Ensures the ScrollView takes full height
    alignItems: "center",
    paddingBottom: 20, // Adds space at the bottom to prevent content from being cut off
    gap: 25,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center", // Centers text vertically in its container
    flex: 1, // Allows it to take up space to be centered
    paddingTop: "10%",
    paddingBottom: "2%",
    alignSelf: "flex-start",
  },
  fullWidthContainer: {
    width: "100%", // Make the rectangle button take full width
    paddingHorizontal: 20, // Keep spacing consistent
    marginBottom: 20,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#A3C7A5",
    //padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    //height: 120, // Fixed height to match the square buttons
    aspectRatio: 2,
    alignSelf: "center",
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
    alignSelf: "flex-start",
  },
  btnContainer: {
    flex: 1,
  },
  minionProBold: {
    fontFamily: "MinionPro-Bold",
    fontSize: RFPercentage(3.2),
  },
  myriadProRegular: {
    fontFamily: "MYRIADPRO-REGULAR",
    fontSize: RFPercentage(2),
    textAlign: "center",
    paddingHorizontal: "10%",
  },
});

// Check if the text is centered
const textElement = styles.myriadProRegular;
console.assert(
  textElement.textAlign === "center",
  "text is not centered properly."
);
