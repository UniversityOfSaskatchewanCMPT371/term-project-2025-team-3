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
import { DISPLAY_CLINIC } from "@/utils/constPaths";
import logger from "@/utils/logger";
import { COLOURS } from "@/utils/colours";

const URL = process.env.EXPO_PUBLIC_CLINIC_LIST_URL;

export default function Page() {
  const [searchVal, setSearchVal] = useState("");

  logger.debug("searchVal", searchVal);

  const { clinicArray, loading, serverAccessFailed, error } = useClinicData({
    clinicService: new ClinicData(),
    url: URL,
    searchValue: searchVal,
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
      <View style={styles.clinicListSection}>
        <View style={styles.clinicListBanner}>
          <Text style={styles.clinicListHeading}>Clinic List</Text>
          <Text style={styles.clinicListSubheading}>
            Clinics offering vaccinations intended for persons under 18 years of
            age
          </Text>
          {serverAccessFailed && (
            <Text style={styles.offline}>Cannot connect to server</Text>
          )}
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.searchBarWrapper}>
            <SearchBar onSubmitEditing={setSearchVal} />
          </View>
        </View>


        {loading && !error && <ActivityIndicator size="large" />}

        <FlatList
          data={filteredClinics}
          renderItem={({ item, index }) => {
            const bgColor = index % 2 ? COLOURS.LIGHT_GREY : COLOURS.WHITE;
            return (
              <View style={{ marginTop: 16 }}>
                <ClinicCard
                  key={index}
                  title={item.name || ""}
                  subtitle={item.serviceArea || ""}
                  text={item.address || ""}
                  bgColor={bgColor}
                  pathname={DISPLAY_CLINIC}
                  params={item}
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
    boxSizing: "border-box",
  },
  clinicListBanner: {
    backgroundColor: COLOURS.WHITE,
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
  },
  clinicListHeading: {
    margin: 0,
    fontSize: 32,
    textDecorationLine: "underline",
    fontWeight: "bold",
    color: COLOURS.BLACK,
  },
  clinicListSubheading: {
    marginTop: 8,
    fontSize: 18,
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
