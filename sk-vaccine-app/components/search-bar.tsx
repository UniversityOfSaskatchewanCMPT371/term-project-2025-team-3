import React, { useState } from 'react';
import { SearchBar as defaultSearchBar } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const COLORS = {
    containerBackground: '#EAE8F1',
    placeholderText: '#6F6F6F',
    iconColor: '#333333',
};

// this is needed because typescript is being difficult
const DefaultSearchBar = defaultSearchBar as any;
// if you want to add a prop, but dont know what it is called, here are the docs
// https://reactnativeelements.com/docs/1.2.0/searchbar#usage

/**
 * Props for the SearchBar component.
 * @property  `value` The value to have in the search bar (optional)
 * @property `placeholder` Placeholder text for the search bar (optional)
 * @property `onChangeText` Called with input when text input is changed (optional)
 * @property `onSubmitEditing` Called with input when search is submited (optional)
 * @property `isTesting` Makes it not cause errors because icons hate tests (optional)
 */
export type SearchBarProps = {
    value?: string;
    placeholder?: string;
    onChangeText?: (text: string) => void;
    onSubmitEditing?: (text: string) => void;
    isTesting?: boolean;
};


/**
 * A customizable search bar component.
 * @param props The props for the SearchBar
 * @param props.value The value to have in the search bar (optional)
 * @param props.placeholder Placeholder text for the search bar (optional)
 * @param props.onChangeText Called with input when text input is changed (optional)
 * @param props.onSubmitEditing Called with input when search is submited (optional)
 * @param props.isTesting Makes it not cause errors because icons hate tests (optional)
 * @returns The SearchBar
 */
export default function SearchBar({ onChangeText, onSubmitEditing, placeholder, value, isTesting }: SearchBarProps) {
    const [search, setSearch] = useState('');

    const currentValue = value !== undefined ? value : search;

    const handleChangeText = (text?: string) => {
        if (onChangeText) {
            onChangeText(text || '');
        }
        if (value === undefined) {
            setSearch(text || '');
        }
    };

    const handleSubmitEditing = () => {
        if (onSubmitEditing) {
            onSubmitEditing(currentValue);
        }
    };

    return (
        <DefaultSearchBar
            platform="default"
            placeholder={placeholder || "Search"}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmitEditing}
            value={currentValue}
            containerStyle={styles.container}
            inputContainerStyle={{
                backgroundColor: 'transparent',
                height: 40,
            }}
            inputStyle={styles.input}
            leftIconContainerStyle={styles.leftIconContainer}
            rightIconContainerStyle={styles.rightIconContainer}
            searchIcon={isTesting ? undefined : { type: 'font-awesome', name: 'search', size: 20, color: COLORS.iconColor, onPress: handleSubmitEditing }}
            placeholderTextColor={COLORS.placeholderText}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.containerBackground,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderRadius: 8,
        width: 300,
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    inputContainer: {
        backgroundColor: 'transparent',
        height: 40,
    },
    input: {
        fontSize: RFPercentage(2),
        color: COLORS.placeholderText,
        fontFamily: "MYRIADPRO-REGULAR",
        padding: 0,
        margin: 0,
    },
    leftIconContainer: {
        marginLeft: 0,
        marginRight: 8,
    },
    rightIconContainer: {
        marginLeft: 8,
        marginRight: 0,
    },
});
