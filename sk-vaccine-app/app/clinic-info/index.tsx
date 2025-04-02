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
import useClinicData from "@/hooks/clinicData";
import ClinicData from "@/services/clinicDataService";
import { PATH_DISPLAY_CLINIC } from "@/utils/constPaths";
import logger from "@/utils/logger";
import { COLOURS } from "@/utils/colours";
import LocationData from "@/services/locationDataService";
import { RFPercentage } from "react-native-responsive-fontsize";

const URL = process.env.EXPO_PUBLIC_CLINIC_LIST_URL;

export default function ClinicInfo() {
  const [searchVal, setSearchVal] = useState("");

  logger.debug("searchVal", searchVal);

  const { clinicArray, loading, serverAccessFailed, error } = useClinicData({
    clinicService: new ClinicData(),
    url: URL,
    searchValue: searchVal,
    sortByDistance: true,
    locationService: new LocationData(),
  });

  const filteredClinics =
    clinicArray?.clinics.filter(
      (clinic) =>
        Array.isArray(clinic.services) &&
        clinic.services.some((service) =>
          service.toLowerCase().includes("child")
        )
    ) || [];

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.clinicListBanner}>
          <Text style={styles.clinicListSubheading}>
            Clinics offering vaccinations intended for persons under 18 years of
            age
          </Text>
          {serverAccessFailed && (
            <Text style={styles.offline}>Cannot connect to server</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.searchBarWrapper}>
            <SearchBar onChangeText={setSearchVal} />
          </View>
        </View>

        <View style={styles.clinicListSection}>
          {loading && !error && <ActivityIndicator size="large" />}

          <FlatList
            data={filteredClinics}
            renderItem={({ item, index }) => {
              const bgColor = index % 2 ? COLOURS.WHITE : COLOURS.LIGHT_GREY;
              return (
                <View style={{ marginTop: 16 }}>
                  <ClinicCard
                    key={index}
                    title={item.name || ""}
                    subtitle={item.serviceArea || ""}
                    text={item.address || ""}
                    bgColor={bgColor}
                    pathname={PATH_DISPLAY_CLINIC}
                    params={item}
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
    marginHorizontal: 3,
    paddingHorizontal: 16,
    fontFamily: "Arial",
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
