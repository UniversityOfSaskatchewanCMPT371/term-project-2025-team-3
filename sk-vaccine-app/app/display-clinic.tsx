import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DisplayClinic() {
    const { data } = useLocalSearchParams<{ data: string }>();
    const parsedData = data ? JSON.parse(data) : null;

    return (
        <View>
            <Text>{parsedData ? parsedData.name : 'No data'}</Text>
        </View>
    );
}