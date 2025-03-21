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
import { updateVaccineSheets, useVaccineSheets } from "@/hooks/vaccineData";
import VaccineDataController from "@/controllers/vaccineDataController";
import { DISPLAY_VACCINE } from "@/utils/constPaths";
import logger from "@/utils/logger";
import { VaccineDataService } from "@/services/vaccineDataService";

const COLORS = {
  WHITE: "#FFFFFF",
  GREY: "#808080",
  RED: "#FF0000",
  ODD_VACCINE: "#C2DAD0",
  EVEN_VACCINE: "#E7F0EC",
  PRIMARY_TEXT: "#333333",
  BANNER_BG: "#B7D4CB",
  SEARCHBAR_BG: "#EFE8EE",
};

export default function Page() {
  const [searchVal, setSearchVal] = useState("");

  logger.debug("searchVal", searchVal);
  updateVaccineSheets(new VaccineDataController(new VaccineDataService))

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
            const bgColor =
              index % 2 ? COLORS.ODD_VACCINE : COLORS.EVEN_VACCINE;
            return (
              <View style={{ marginTop: 16 }}>
                <ClinicCard
                  key={index}
                  title={item.vaccineName}
                  subtitle={item.starting}
                  bgColor={bgColor}
                  pathname={DISPLAY_VACCINE}
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
    backgroundColor: COLORS.WHITE,
  },
  clinicListSection: {
    flex: 1,
    marginHorizontal: 3,
    paddingHorizontal: 16,
    fontFamily: "Arial",
    color: COLORS.PRIMARY_TEXT,
  },
  clinicListBanner: {
    backgroundColor: COLORS.BANNER_BG,
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  clinicListHeading: {
    margin: 0,
    fontSize: 32,
    textDecorationLine: "underline",
    fontWeight: "bold",
    color: COLORS.PRIMARY_TEXT,
  },
  clinicListSubheading: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 22,
    color: COLORS.PRIMARY_TEXT,
  },
  searchBarWrapper: {
    backgroundColor: COLORS.SEARCHBAR_BG,
    borderRadius: 24,
    marginVertical: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clinicCardsContainer: {
    paddingBottom: 24,
  },
  offline: {
    color: COLORS.GREY,
  },
  error: {
    color: COLORS.RED,
  },
});
