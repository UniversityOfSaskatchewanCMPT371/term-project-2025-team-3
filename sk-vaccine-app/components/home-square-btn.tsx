import {
  StyleSheet,
  Pressable,
  Text,
  ViewStyle,
  View,
  TextStyle,
} from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Link, LinkProps } from "expo-router";
import logger from "@/utils/logger";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { COLOURS } from "@/utils/colours";

interface SquareButtonProps {
  path: LinkProps["href"];
  text: string;
  //onPress?: () => void; // Optional callback for additional actions
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * A square button with rounded edges for the home page.
 * @component
 * @param {SquareButtonProps} props - The properties of the button.
 * @param {LinkProps['href']} props.path - The navigation path for the button.
 * @param {string} props.text - The text displayed inside the button.
 * @param {ViewStyle} [props.style] - Optional custom styles for the button container.
 * @param {TextStyle} [props.textStyle] - Optional custom styles for the text inside the button.
 * @returns {JSX.Element} The rendered button component.
 */
export default function SquareButton({
  path,
  text,
  style,
  //onPress,
  textStyle,
}: SquareButtonProps): JSX.Element {
  const logPress = () => {
    logger.info("Square button pressed.");
  };

  return (
    <Link href={path as LinkProps["href"]} asChild>
      <Pressable onPress={logPress} hitSlop={0}>
        <View style={[styles.container, style]}>
          <Text style={[styles.text, textStyle]}>
            {text.replace(" ", "\n")}
          </Text>
          <Feather name="chevron-right" size={45} color="black" style={styles.chevron}/>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOURS.GREEN,
    //padding: 20,
    borderRadius: 35,
    overflow: "hidden",
    aspectRatio: 1,
    justifyContent: "space-between", // Spaces text and arrow
    //flex: 1,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  text: {
    color: COLOURS.WHITE,
    marginHorizontal: 20,
    marginTop: 15,
    fontSize: RFPercentage(4.2),
    fontWeight: "semibold",
    textAlign: "left",
  },
  chevron: {
    marginRight: 10,
    color: COLOURS.WHITE,
    marginBottom: 20,
    fontSize: RFPercentage(4.5),
    alignSelf: "flex-end", // Moves icon to bottom-right
  },
});
