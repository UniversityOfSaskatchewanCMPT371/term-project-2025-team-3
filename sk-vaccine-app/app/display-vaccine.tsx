import assert from "assert";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import Pdf from "react-native-pdf";
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
      <View style={{ flex: 1, backgroundColor: "#0B6A41" }}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>{pageData.vaccineName}</Text>
          <Text style={styles.headerSubtitle}>
            Starting Age/Grade: {pageData.starting}
          </Text>
        </View>

        <Pdf
          source={{ uri: pageData.pdfPath }}
          trustAllCerts={false}
          style={{
            flex: 1,
            width: Dimensions.get("window").width - 12, // Subtracting for margin on both sides
            marginLeft: 4, // Left margin
            marginRight: 4, // Right margin
            backgroundColor: "#0B6A41",
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: RFPercentage(3.6),
    fontWeight: "semibold",
    textDecorationLine: "underline",
    marginBottom: 4,
    color: "#000",
  },
  headerSubtitle: {
    fontSize: RFPercentage(1.9),
    color: "#000",
  },
});
