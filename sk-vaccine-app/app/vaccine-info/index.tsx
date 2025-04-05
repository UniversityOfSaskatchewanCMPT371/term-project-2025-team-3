import SearchBar from "@/components/search-bar";
import ClinicCard from "@/components/card-link";
import React, { useEffect, useState } from "react";
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
import { useNavigation } from "expo-router";

export default function VaccineInfo() {
  const [searchVal, setSearchVal] = useState("");

  logger.debug("searchVal", searchVal);
  //updateVaccineSheets(new VaccineDataController(new VaccineDataService))

  const { vaccineSheets, loading, error, fetchResults } = useVaccineSheets({
    vaccineController: new VaccineDataController(new VaccineDataService()),
  });

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => null, // Force-remove SettingsButton at runtime
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.clinicListBanner}>
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
        <View style={styles.clinicListSection}>
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
                    subtitle={`Starting Age/Grade: ${item.starting}`}
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
    paddingBottom: 50,
    marginBottom: 50,
    fontFamily: "MYRIADPRO-REGULAR",
    color: COLOURS.BLACK,
  },
  clinicListBanner: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: COLOURS.WHITE,
    borderBottomWidth: 0, // Border thickness
    shadowColor: "#000", // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
    elevation: 5, // Shadow for Android
  },
  clinicListHeading: {
    margin: 0,
    fontSize: RFPercentage(3.5),
    textDecorationLine: "underline",
    fontFamily: "MYRIADPRO-REGULAR",
    fontWeight: "bold",
    color: COLOURS.BLACK,
  },
  clinicListSubheading: {
    marginTop: 8,
    fontSize: RFPercentage(2),
    fontFamily: "MYRIADPRO-REGULAR",
    lineHeight: 22,
    color: COLOURS.BLACK,
  },
  searchBarWrapper: {
    backgroundColor: COLOURS.SEARCHBAR_BG,
    borderRadius: 24,
    marginTop: 16,
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
