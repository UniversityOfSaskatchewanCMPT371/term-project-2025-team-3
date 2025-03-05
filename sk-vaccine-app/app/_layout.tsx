import "reflect-metadata";
import { Stack } from "expo-router";
import { Image, View, Text } from "react-native";
import { memo } from "react";
import React from "react";
import SettingsButton from "@/components/settings-btn";

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
          <Text style={{ fontSize: 25, lineHeight: 28 }}>
            College of Nursing
          </Text>
          <Text style={{ fontSize: 38, lineHeight: 38, marginTop: -3 }}>
            Immunize
          </Text>
        </View>
    </View>
  );
});

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitle: () => <CustomHeader />, // Memoize the header, supposed to prevent updates but I am unsure about that
        headerTitleAlign: "center",
      }}
    />
  );
}
