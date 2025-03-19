import assert from "assert";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View, Text, Dimensions } from "react-native";
import Pdf from "react-native-pdf";
import * as DocumentPicker from "expo-document-picker";
import logger from "@/utils/logger";
import { VaccineSheet } from "@/interfaces/iVaccineData";
import * as FileSystem from "expo-file-system";

export default function DisplayVaccine() {
  const { data } = useLocalSearchParams<{ data: string }>();
  assert(data, "No data given to DisplayVaccine page in routing parameters");
  const parsedData = JSON.parse(data);

  const pageData: VaccineSheet = parsedData;
  //const vaccineName = pageData.vaccineName;

  logger.debug(pageData);

  const checkFileExists = async (path: string) => {
    const fileInfo = await FileSystem.getInfoAsync(path);
    logger.debug("File Info:", fileInfo);
  };
  checkFileExists(pageData.pdfPath);

  

  return (
    <>
     <View style={{ flex: 1 }}>
 
    <View>
      <Text>{pageData.vaccineName}</Text>
      <Text>{pageData.starting}</Text>
    </View>
  
  <Pdf
    source={{ uri: pageData.pdfPath }}
    trustAllCerts={false}
    style={{ flex: 1, width: Dimensions.get("window").width }}
  />
</View>

    </>
  );
}
