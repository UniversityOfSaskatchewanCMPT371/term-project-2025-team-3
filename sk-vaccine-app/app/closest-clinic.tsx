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

const URL = process.env.EXPO_PUBLIC_CLINIC_LIST_URL;

export default function Page() {
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
    <View style={styles.container}>
        <ActivityIndicator size="large"/>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });