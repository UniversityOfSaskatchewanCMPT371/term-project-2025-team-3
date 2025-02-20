import 'reflect-metadata';
import { Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
import { View, Text } from "react-native";
import DatabaseInitializer from '@/components/db-init';





  
export default function RootLayout() {

  return (
          <DatabaseInitializer>
            <Stack />;
          </DatabaseInitializer>
          );
}


