import SearchBar from '@/components/search-bar';
import ClinicCard from '@/components/card-link';
import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, StyleSheet } from 'react-native';
import useClinicData from '@/hooks/clinicData';
import ClinicData from '@/services/clinicDataService';
import { ActivityIndicator } from 'react-native';
import { DISPLAY_CLINIC } from '@/utils/constPaths';
import logger from '@/utils/logger';





const COLORS = {
    WHITE: '#FFFFFF',
    GREY: '#808080',
    RED: '#FF0000',
    ODD_CLINIC: '#C2DAD0',
    EVEN_CLINIC: '#E7F0EC',
    PRIMARY_TEXT: '#333333',
    BANNER_BG: '#B7D4CB',
    SEARCHBAR_BG: '#EFE8EE',
};



const URL = undefined;



// TODO make url an env variable

export default function Page() {
    const [searchVal, setSearchVal]= useState('');

    logger.debug("searchVal", searchVal);



    const {clinicArray, loading, serverAccessFailed, error} = useClinicData({
        clinicService: new ClinicData(),
        url: URL,
        searchValue: searchVal
    });


    const clinicElements = clinicArray?.clinics
        // removes clinics that are not for children
        .filter(
            clinic =>
                Array.isArray(clinic.services) &&
                clinic.services.includes('children')
        )
        // builds a clinic link
        .map((clinic, index) => {
            const bgColor = index % 2 ? COLORS.ODD_CLINIC : COLORS.EVEN_CLINIC;
            return (
                <ClinicCard 
                    key={index}
                    title={clinic.serviceArea} 
                    subtitle={clinic.name} 
                    text={clinic.address} 
                    bgColor={bgColor}
                    pathname={DISPLAY_CLINIC}
                    params={clinic}
                />
            );
        });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.clinicListSection}>
                <View style={styles.clinicListBanner}>
                    <Text style={styles.clinicListHeading}>Clinic List</Text>
                    <Text style={styles.clinicListSubheading}>
                        Clinics offering vaccinations intended for persons under 18 years of age
                    </Text>
                    
                    {/* display offline */}
                    {serverAccessFailed && (
                        <Text style={styles.offline}>Cannot connect to server</Text>
                    )}

                    {/* display error */}
                    {error && (
                        <Text style={styles.error}>{error}</Text>
                    )}
                    <View style={styles.searchBarWrapper}>


                        
                        <SearchBar value={searchVal} onChangeText={setSearchVal} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.clinicCardsContainer}>


                    {/* loading indicator */}
                    {loading && !error && <ActivityIndicator size="large" />}

                    {/* display clinics */}
                    {clinicElements}
                
                </ScrollView>
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
        fontFamily: 'Arial',
        color: COLORS.PRIMARY_TEXT,
        boxSizing: 'border-box',
    },
    clinicListBanner: {
        backgroundColor: COLORS.BANNER_BG,
        padding: 16,
        borderRadius: 4,
        marginTop: 16,
    },
    clinicListHeading: {
        margin: 0,
        fontSize: 22,
        textDecorationLine: 'underline',
        fontWeight: 'bold',
        color: COLORS.PRIMARY_TEXT,
    },
    clinicListSubheading: {
        marginTop: 8,
        fontSize: 16,
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
    searchBarContainer: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
    },
    searchBarInputContainer: {
        backgroundColor: 'transparent',
        height: 32,
    },
    clinicCardsContainer: {
        paddingBottom: 24,
    },
    offline: {
        color: COLORS.GREY,
    },
    error: {
        color: COLORS.RED,
    }
});
