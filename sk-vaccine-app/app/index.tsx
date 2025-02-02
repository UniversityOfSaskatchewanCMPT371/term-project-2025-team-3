import { Text, View, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Link } from 'expo-router';
import React from "react";




export default function Index() {
  return (
    <View>
      <View>
        <Link href={"./map"}>Map with offline support</Link>
      </View>

    </View>



    
  );
}


