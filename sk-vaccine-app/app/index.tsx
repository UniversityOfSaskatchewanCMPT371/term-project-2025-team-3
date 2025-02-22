import SquareButton from '@/components/home-btn-square';
import { StyleSheet, Text, View, Image } from 'react-native';
// eslint-disable-next-line
import logger from '@/utils/logger';
import ChinButton from '@/components/home-btn-chin';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import {
  PATH_VACCINE_INFO,
  CLINIC_INFO,
} from '../utils/constPaths'
import DatabaseInitializer from '@/components/db-init';


export const CLINIC_BTN_TEXT = "Clinic Information";
export const BOOKING_BTN_TEXT = "Booking";
export const RECORDS_BTN_TEXT = "My Records";
export const VACCINE_BTN_TEXT = "Vaccine Info";

/**
 * The home screen of the Sask Immunize app.
 * 
 * This screen provides navigation to various sections of the app, including vaccine information, 
 * clinic details, and personal records. It features a logo, title, and multiple navigation buttons.
 * 
 * @component
 * @returns {JSX.Element} - The rendered home screen component.
 
 */
export default function Index() {
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({ headerShown: true });
    }, [navigation]);

    return (
      <DatabaseInitializer>
        <View style={{ flex: 1 }}>
            <View style={styles.horizontalContainer}>
                <View style={styles.btnContainer}>
                    <SquareButton
                        path={PATH_VACCINE_INFO}
                        text={VACCINE_BTN_TEXT}
                        style={{ backgroundColor: "#3E6BFF", aspectRatio: 1 }}
                    />
                </View>
                <View style={styles.btnContainer}>
                    <SquareButton
                        path={CLINIC_INFO}
                        text={CLINIC_BTN_TEXT}
                        textStyle={{ color: "black" }}
                        style={{ backgroundColor: "#74FF99", aspectRatio: 1 }}
                    />
                </View>
            </View>
            <View style={styles.horizontalContainer}>
                <View style={styles.btnContainer}>
                    <SquareButton
                        path={"/vaccine-info"}
                        text={BOOKING_BTN_TEXT}
                        style={{ backgroundColor: "#FFC250", aspectRatio: 1 }}
                    />
                </View>
                <View style={styles.btnContainer}>
                    <SquareButton
                        path={"/vaccine-info"}
                        text="Test"
                        style={{ backgroundColor: "#FF8787", aspectRatio: 1 }}
                    />
                </View>
            </View>
            <View>
                <ChinButton path={"/vaccine-info"} text={RECORDS_BTN_TEXT} />
            </View>
        </View>
      </DatabaseInitializer>
    );

}

const styles = StyleSheet.create({
    horizontalContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly",
        gap: 10,
        paddingHorizontal: 10,
        paddingBottom: 5,
        alignItems: "center",
    },
    btnContainer: {
        flex: 1,
    },
});
