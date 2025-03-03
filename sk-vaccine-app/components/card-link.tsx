import { Link } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
    WHITE: '#FFFFFF',
    DARK_GRAY: '#333333',
    LIGHT_GRAY: '#666666',
    SHADOW_COLOR: '#000000',
};

type CardLinkProps = {
    title: string;
    subtitle: string;
    text: string;
    pathname: string;
    params?: any;
    bgColor?: string;
    textColor?: string;
};

/**
 * the component displays clinic information, and is a link.
 * @param props The props for the component
 * @param {string} props.title The title of the card
 * @param {string} props.subtitle The subtitle or description of the card
 * @param {string} props.text The text for the card
 * @param {string} props.pathname The URL to redirect to when the card is clicked
 * @param {string} props.params The `data` parameter for the href, is turned to json when passed to page
 * @param {string} props.bgColor The card's background color (optional)
 * @param {string} props.textColor The card's text color (optional)
 * @returns A clickable card with the title, subtitle, and text
 */
export default function CardLink({ title, subtitle, text, pathname, params, bgColor, textColor }: CardLinkProps) {
    return (
        <Link href={{
            pathname: pathname as any,
            params: { data: JSON.stringify(params) },
        }}>
            <View style={[styles.clinicCard, {backgroundColor: bgColor}]}>
                <Text style={[styles.clinicCardTitle, {color: textColor}]}>{title}</Text>
                <Text style={[styles.clinicCardSubtitle, {color: textColor}]}>{subtitle}</Text>
                <Text style={[styles.clinicCardAddress, {color: textColor}]}>{text}</Text>
            </View>
        </Link>
    );
}

const styles = StyleSheet.create({
    clinicCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowColor: COLORS.SHADOW_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    clinicCardTitle: {
        margin: 0,
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.DARK_GRAY,
    },
    clinicCardSubtitle: {
        marginTop: 4,
        fontSize: 14,
        color: COLORS.DARK_GRAY,
    },
    clinicCardAddress: {
        marginTop: 4,
        fontSize: 13,
        color: COLORS.LIGHT_GRAY,
    },
});
