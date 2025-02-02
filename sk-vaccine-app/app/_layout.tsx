import { Stack } from "expo-router";
import React from "react";

import MapboxGL from '@rnmapbox/maps';
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAP_BOX_API_KEY as string);


export default function RootLayout() {
  return <Stack />;
}
