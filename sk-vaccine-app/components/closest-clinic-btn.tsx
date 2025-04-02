import React from "react";
import { StyleSheet, Pressable, Text, View } from "react-native";
import { Link, LinkProps } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";
import { COLOURS } from "@/utils/colours";

interface ClosestClinicBtnProps {
  href?: LinkProps["href"];
  hours?: string,
  clinicName?: string
  address?: string
}

/**
 * A button that displays information about the closest clinic.
 * @param {LinkProps["href"]} props.href The title of the card  (optional)
 * @param {string} props.hours The hours the clinic is open (optional)
 * @param {string} props.clinicName The name of the clinic (optional)
 * @param {string} props.address The address of the clinic. Only used if the hours are undefined(optional)
 */
export default function ClosestClinicButton({ href, hours, clinicName, address }: ClosestClinicBtnProps) {
  const ButtonContent = (
    <Pressable style={styles.container}>
      {/* Left Side: "Your Closest Clinic" & Directions */}
      <View style={styles.leftContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.clinicTitle}>Your Closest Clinic</Text>
          <Feather
            name="chevron-right"
            size={45}
            style={{ alignSelf: 'flex-end', color: COLOURS.WHITE, marginRight: 10, fontSize: RFPercentage(4.5)}}
          />
        </View>
      </View>

      {/* Right Side: Clinic Details */}
      <View style={styles.rightContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.clinicName}>{clinicName}</Text>
          <Text style={styles.clinicHours}>
            {hours ? <Text style={{ fontWeight: 'bold', fontFamily: "MYRIADPRO-REGULAR" }}>Hours:{'\n'}</Text> : null}
            {hours}
            {(!hours && address) ? <Text style={{ fontWeight: 'bold', fontFamily: "MYRIADPRO-REGULAR" }}>Address:{'\n'}</Text> : null}
            {!hours ? address : null}

          </Text>
        </View>
      </View>
    </Pressable>
  );

  return href ? (
    <Link href={href} asChild>
      {ButtonContent}
    </Link>
  ) : (
    ButtonContent
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLOURS.GREEN,
    padding: 15,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "space-between",
    aspectRatio: 2,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  leftContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row", // Puts text and chevron side by side
    alignItems: "center", // Aligns them vertically
  },
  clinicTitle: {
    fontSize: RFPercentage(4.2),
    color: COLOURS.WHITE,
    marginBottom: 25,
    fontWeight: "semibold",
    fontFamily: "MYRIADPRO-REGULAR",
  },

  directions: {
    fontSize: RFPercentage(2),
    color: "#333",
  },

  rightContainer: {
    flex: 0.8,
    backgroundColor: COLOURS.LIGHT_GREY,
    padding: 10,
    borderRadius: 22,
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "center",
  },

  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  clinicDate: {
    fontSize: RFPercentage(2.2),
    fontWeight: "bold",
    marginRight: 6,
    fontFamily: "MYRIADPRO-REGULAR"
  },

  clinicDay: {
    fontSize: RFPercentage(1.5),
    fontWeight: "bold",
    fontFamily: "MYRIADPRO-REGULAR"
  },

  clinicMonth: {
    fontSize: RFPercentage(1.4),
    color: "#666",
    fontFamily: "MYRIADPRO-REGULAR"
  },

  infoContainer: {
    flex: 1,
    //justifyContent: "space-between",
    alignItems: "center",
  },

  clinicName: {
    fontSize: RFPercentage(2.2),
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    fontFamily: "MYRIADPRO-REGULAR"
  },

  clinicHours: {
    fontSize: RFPercentage(1.7),
    textAlign: "center",
    fontFamily: "MYRIADPRO-REGULAR"
  },
});
