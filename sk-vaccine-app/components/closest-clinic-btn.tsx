import React from "react";
import { StyleSheet, Pressable, Text, View } from "react-native";
import { Link, LinkProps } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";

interface ClosestClinicBtnProps {
  path: LinkProps["href"];
}

/**
 * A button that displays information about the closest clinic.
 * @component
 */
export default function ClosestClinicButton({ path }: ClosestClinicBtnProps) {

  const hours = "1:00pm - 4:00pm"
  const clinicName = "Our Neighbourhood Health Centre";


  return (
    <Link href={path} asChild>
      <Pressable style={styles.container}>
        {/* Left Side: "Your Closest Clinic" & Directions */}
        <View style={styles.leftContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.clinicTitle}>Your Closest Clinic</Text>
            <Feather
              name="chevron-right"
              size={45}
              style={{ alignSelf: "flex-end", marginRight: 10 }}
            />
          </View>
        </View>

        {/* Right Side: Clinic Details */}
        <View style={styles.rightContainer}>
          {/*<View style={styles.dateBox}>
            <Text style={styles.clinicDate}>5</Text>
            <View>
              <Text style={styles.clinicDay}>Tuesday</Text>
              <Text style={styles.clinicMonth}>November</Text>
            </View>
          </View>*/}
          <View style={styles.infoContainer}>
            <Text style={styles.clinicName}>
              {clinicName}
            </Text>
            <Text style={styles.clinicHours}>
              <Text style={{ fontWeight: "bold" }}>Hours:{`\n`}</Text>{hours} 
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#85B4A0",
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
    fontSize: 40,
    //lineHeight: 38,
    marginBottom: 25,
    fontWeight: "semibold",
  },

  directions: {
    fontSize: 18,
    color: "#333",
  },

  rightContainer: {
    flex: 0.8,
    backgroundColor: "#C2DAD0",
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
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 6,
  },

  clinicDay: {
    fontSize: 12,
    fontWeight: "bold",
  },

  clinicMonth: {
    fontSize: 10,
    color: "#666",
  },

  infoContainer: {
    flex: 1,
    //justifyContent: "space-between",
    alignItems: "center",
  },

  clinicName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "flex-start"
  },

  clinicHours: {
    fontSize: 15,
    textAlign: "center",
  },
});
