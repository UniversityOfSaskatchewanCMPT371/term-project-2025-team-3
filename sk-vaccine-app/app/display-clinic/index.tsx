import MapEmbed from '@/components/map';
import { Clinic } from '@/services/clinicDataService';
import assert from 'assert';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const COLORS = {
    CONTAINER_BG: '#f8f8f8',
    CARD_BG: '#C2DAD0',
    SHADOW: '#000',
    TEXT_SUBTITLE: '#666',
    TEXT_PRIMARY: '#333',
    LINK: '#007bff',
    MAP_BG: '#ccc',
    DISTANCE_TEXT: '#777',
};

export default function DisplayClinic() {
    const { data } = useLocalSearchParams<{ data: string }>();
	assert(data, "No data given to DisplayClinic page in routing parameters");
    const parsedData = JSON.parse(data);
	
    const clinic: Clinic = parsedData || {};
    const clinicName = clinic.name || "Clinic Name Not Provided";
    const clinicServiceArea = clinic.serviceArea || "Service Area Not Provided";
    const clinicContactInfo = clinic.contactInfo || "Contact Info Not Provided";
    const clinicServices = clinic.services ? clinic.services : [];
    const clinicAddress = clinic.address || "Address Not Provided";
    const clinicHours = clinic.hours || "Hours Not Provided";

    return (
        <>
            <ScrollView style={styles.container}>
                <View style={styles.headerCard}>
                    <Text style={styles.headerSubtitle} selectable>{clinicServiceArea}</Text>
                </View>

                <View style={styles.infoRow}>
                    <View style={[styles.cardContainer, styles.flexCard, styles.leftCard]}>
                        <Text style={styles.titleText}>Contact Info</Text>
                        <Text style={styles.bodyText} selectable>{clinicContactInfo}</Text>
                    </View>
                    <View style={[styles.cardContainer, styles.flexCard, styles.rightCard]}>
                        <Text style={styles.titleText}>Vaccination Services</Text>
                        <View style={styles.vaccinationServices} >
                            {clinicServices.map((service, index) => (
                                <Text key={index} style={styles.bodyText} selectable>{service}</Text>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.cardContainer}>
                    <Text style={styles.titleText}>Hours of Operation</Text>
                    <Text style={styles.bodyText} selectable>{clinicHours}</Text>
                </View>

                <View style={styles.cardContainer}>
                    <Text style={styles.titleText}>Clinic Location</Text>
                    <Text style={styles.bodyText} selectable>{clinicAddress}</Text>
                    <View style={styles.mapContainer}>
						{
							/* 
								only display the map if the clinic has a name, 
								address or coordinate
							*/
						}
						{
							(clinic.name || clinic.address ||
							(clinic.latitude && clinic.longitude)) &&
							<MapEmbed
								name={clinic.name}
								address={clinic.address}
								latitude={clinic.latitude}
								longitude={clinic.longitude}
							/>
                      	}
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.CONTAINER_BG,
    },
    headerCard: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 8,
        padding: 16,
        margin: 20,
        marginBottom: 16,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardContainer: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
    },
    flexCard: {
        flex: 1,
        marginHorizontal: 0,
    },
    leftCard: {
        marginRight: 8,
    },
    rightCard: {
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: RFPercentage(3),
        fontWeight: 'bold',
        marginBottom: 8,
        color: COLORS.TEXT_PRIMARY,
    },
    headerSubtitle: {
        fontSize: RFPercentage(2.6),
        color: COLORS.TEXT_SUBTITLE,
        marginBottom: 4,
    },
    titleText: {
        fontSize: RFPercentage(2.6),
        fontWeight: 'bold',
        marginBottom: 6,
        color: COLORS.TEXT_PRIMARY,
    },
    bodyText: {
        fontSize: RFPercentage(1.9),
        marginBottom: 12,
        color: COLORS.TEXT_PRIMARY,
    },
    vaccinationServices: {
        marginBottom: 12,
    },
    mapContainer: {
        width: '100%',
        height: 400,
        backgroundColor: COLORS.MAP_BG,
        borderRadius: 4,
    },
});
