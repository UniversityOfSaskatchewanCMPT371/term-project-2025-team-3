import { Feather, FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

export default function SettingsButton() {
  return (
    <Link href="/settings" asChild>
      <Pressable
        style={styles.settingsButton}
        onPress={() => console.log("Settings Pressed")}
      >
        <FontAwesome name="gear" size={45} color="gray" />
      </Pressable>
    </Link>
  );
}

const styles = {
  settingsButton: {
    position: "absolute" as "absolute",
    bottom: 20,
    right: 20, 
    backgroundColor: "white",
    margin: 10,
    borderRadius: 50,
  },
};
