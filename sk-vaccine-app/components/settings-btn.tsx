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
        <FontAwesome name="gear" size={30} color="black" />
      </Pressable>
    </Link>
  );
}

const styles = {
  settingsButton: {
    //position: "absolute" as "absolute",
    //bottom: 20,
    //right: 20, 
    backgroundColor: "white",
    marginRight: 10,
    //margin: 10,
    borderRadius: 50,
    padding:10,
  },
};
