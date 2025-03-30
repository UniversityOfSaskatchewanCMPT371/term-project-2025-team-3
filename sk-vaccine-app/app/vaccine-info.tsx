import SearchBar from "@/components/search-bar";
import ClinicCard from "@/components/card-link";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useUpdateVaccineSheets, useVaccineSheets } from "@/hooks/vaccineData";
import VaccineDataController from "@/controllers/vaccineDataController";
import { PATH_DISPLAY_VACCINE } from "@/utils/constPaths";
import logger from "@/utils/logger";
import { VaccineDataService } from "@/services/vaccineDataService";
import { COLOURS } from "@/utils/colours";
import { RFPercentage } from "react-native-responsive-fontsize";


export default function Page() {
  const [searchVal, setSearchVal] = useState("");

  logger.debug("searchVal", searchVal);
  //updateVaccineSheets(new VaccineDataController(new VaccineDataService))

  const { vaccineSheets, loading, error, fetchResults } = useVaccineSheets({
    vaccineController: new VaccineDataController(new VaccineDataService()),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.clinicListSection}>
        <View style={styles.clinicListBanner}>
          <Text style={styles.clinicListHeading}>Vaccine List</Text>
          <Text style={styles.clinicListSubheading}>
            Vaccinations intended for persons under 18 years of age
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchVal}
              onChangeText={setSearchVal}
              onSubmitEditing={() => fetchResults(searchVal)}
            />
          </View>
        </View>

        {loading && !error && <ActivityIndicator size="large" />}

        <FlatList
          data={vaccineSheets}
          renderItem={({ item, index }) => {
            const bgColor = index % 2 ? COLOURS.WHITE : COLOURS.LIGHT_GREY;
            logger.debug(`Pdf path ${item.pdfPath}`);
            return (
              <View style={{ marginTop: 16 }}>
                <ClinicCard
                  key={index}
                  title={item.vaccineName}
                  subtitle={item.starting}
                  bgColor={bgColor}
                  pathname={PATH_DISPLAY_VACCINE}
                  params={item}
                  text={""}
                />
              </View>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.clinicCardsContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOURS.WHITE,
  },
  clinicListSection: {
    flex: 1,
    marginHorizontal: 3,
    paddingHorizontal: 16,
    fontFamily: "Arial",
    color: COLOURS.BLACK,
  },
  clinicListBanner: {
    backgroundColor: COLOURS.WHITE,
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  clinicListHeading: {
    margin: 0,
    fontSize: RFPercentage(3.5),
    textDecorationLine: "underline",
    fontWeight: "bold",
    color: COLOURS.BLACK,
  },
  clinicListSubheading: {
    marginTop: 8,
    fontSize: RFPercentage(2),
    lineHeight: 22,
    color: COLOURS.BLACK,
  },
  searchBarWrapper: {
    backgroundColor: COLOURS.SEARCHBAR_BG,
    borderRadius: 24,
    marginVertical: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clinicCardsContainer: {
    paddingBottom: 24,
  },
  offline: {
    color: COLOURS.GREY,
  },
  error: {
    color: COLOURS.STATUS_RED,
  },
});
