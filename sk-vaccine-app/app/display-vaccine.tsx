import assert from "assert";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View, Text } from "react-native";
import Pdf from "react-native-pdf";
import * as DocumentPicker from "expo-document-picker";

type vaccinePageData = {
    vaccineName: string;
    starting: string,
    pdfLink: string;
}

export default function DisplayVaccine() {
    const { data } = useLocalSearchParams<{data: string}>();
    assert(data, "No data given to DisplayVaccine page in routing parameters")
    const parsedData = JSON.parse(data);

    const pageData: vaccinePageData = parsedData;
    //const vaccineName = pageData.vaccineName;

    

  return (
    <>
      <ScrollView>
        <View>
            <Text>{pageData.vaccineName}</Text>
            <Text>{pageData.starting}</Text>
        </View>

      </ScrollView>
    </>
  );
}
