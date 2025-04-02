import { Link } from "expo-router";
import React from "react";
import { COLOURS } from "@/utils/colours";
import { RFPercentage } from "react-native-responsive-fontsize";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  WHITE: "#FFFFFF",
  DARK_GRAY: "#333333",
  LIGHT_GRAY: "#666666",
  SHADOW_COLOR: "#000000",
};

type CardLinkProps = {
  title: string;
  subtitle: string;
  text: string;
  pathname: string;
  params?: any;
  bgColor?: string;
  textColor?: string;
};

/**
 * the component displays clinic information, and is a link.
 * @param props The props for the component
 * @param {string} props.title The title of the card
 * @param {string} props.subtitle The subtitle or description of the card
 * @param {string} props.text The text for the card
 * @param {string} props.pathname The URL to redirect to when the card is clicked
 * @param {string} props.params The `data` parameter for the href, is turned to json when passed to page
 * @param {string} props.bgColor The card's background color (optional)
 * @param {string} props.textColor The card's text color (optional)
 * @returns A clickable card with the title, subtitle, text and an arrow icon
 */
export default function CardLink({
  title,
  subtitle,
  text,
  pathname,
  params,
  bgColor,
  textColor,
}: CardLinkProps) {
  return (
    <Link
      href={{
        pathname: pathname as any,
        params: { data: JSON.stringify(params) },
      }}
      style={{ marginHorizontal: 3, paddingHorizontal: 16 }}
    >
      <View style={[styles.clinicCard, { backgroundColor: bgColor }]}>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={[styles.clinicCardTitle, { color: textColor }]}>
              {title}
            </Text>
            <Text style={[styles.clinicCardSubtitle, { color: textColor }]}>
              {subtitle}
            </Text>
            <Text style={[styles.clinicCardAddress, { color: textColor }]}>
              {text}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={24}
            color={textColor || COLORS.DARK_GRAY}
          />
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  clinicCard: {
    width: "100%",
    maxHeight: 200,
    backgroundColor: COLOURS.WHITE,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 }, // Centered shadow
    shadowOpacity: 0.2,
    shadowRadius: 6,

    // Android shadow
    elevation: 8, // Higher elevation for a more prominent shadow
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  clinicCardTitle: {
    margin: 0,
    fontSize: RFPercentage(2.8),
    fontFamily: "MYRIADPRO-REGULAR",
    fontWeight: "bold",
    color: COLORS.DARK_GRAY,
  },
  clinicCardSubtitle: {
    marginTop: 6,
    fontFamily: "MYRIADPRO-REGULAR",
    fontSize: RFPercentage(2.3),
    color: COLORS.DARK_GRAY,
  },
  clinicCardAddress: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: RFPercentage(1.8),
    fontFamily: "MYRIADPRO-REGULAR",
    color: COLORS.LIGHT_GRAY,
  },
});
