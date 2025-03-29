import { Feather, FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Pressable, View, StyleSheet} from "react-native";

export default function SettingsButton() {
  return (
    <Link href="/settings" asChild>
      <Pressable

      style = {styles.settingsButton}
      onPress={() => console.log("Settings Pressed")}
      >
        <FontAwesome name="gear" size={30} color="black" />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  settingsButton:
    {
      marginRight: 20,
      borderRadius:50,
      padding:10,
      position: 'absolute',
      top:-10,
      right: -35
    }
});
