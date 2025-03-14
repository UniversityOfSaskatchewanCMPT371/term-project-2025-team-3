import { InvalidArgumentError } from '@/utils/ErrorTypes';
import logger from '@/utils/logger';
import assert from 'assert';
import React from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

/**
 * Props for the MapEmbed component.
 *
 * @typedef {Object} MapEmbedProps
 * @property {string} [name] The name of the location.
 * @property {string} [address] The address of the location.
 * @property {number} [longitude] The longitude coordinate.
 * @property {number} [latitude] The latitude coordinate.
 * @property {number} [zoomLevel=15] The zoom level for the map (default is 15)
 */
export type MapEmbedProps = {
    name?: string;
    address?: string;
    longitude?: number;
    latitude?: number;
    zoomLevel?: number;
};

/**
 * Displays a Google Maps embed.
 * The component places a marker on the location of the `name` and `address` or
 * the `latitude` and `longitude` coordinates. If neither is provided it throws an error.
 * 
 * @preconditions This component must be in a component with an explicit height
 * @param {MapEmbedProps} props The props for the component
 * @property {string} `props.name` The name of the location
 * @property {string} `props.address` The address of the location
 * @property {number} `props.longitude` The longitude coordinate
 * @property {number} `props.latitude` The latitude coordinate
 * @property {number} `props.zoomLevel` The zoom level for the map (default is 15)
 * @returns An embedded Google Map.
 * @throws {InvalidArgumentError} If no location data is provided
 */
export default function MapEmbed(props: MapEmbedProps): JSX.Element {
    const { name, address, longitude, latitude, zoomLevel = 15 } = props;

    let mapUrl: string = '';

    if (name || address) {
        const query = encodeURIComponent(`${name ? name : ''} ${address ? address : ''}`);
        mapUrl = `https://maps.google.com/maps?q=${query}&z=${zoomLevel}&output=embed`;
    } else if (latitude !== undefined && longitude !== undefined) {
        mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoomLevel}&output=embed`;
    } else {
        logger.info('No location provided for map embed');
        throw new InvalidArgumentError("No location provided for map embed")
    }

    assert((name || address) || (latitude !== undefined && longitude !== undefined), "Should have thrown InvalidArgumentError");
    logger.info('Map URL generated:', { mapUrl });

    const html = `
    <!DOCTYPE html>
    <html style="height:100%; width:100%;">
        <head>
            <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
        </head>
        <body style="margin:0; padding:0; height:100%; width:100%;">
            <iframe
                src="${mapUrl}"
                width="100%"
                height="100%"
                frameborder="0"
                style="border:0;"
                allowfullscreen>
            </iframe>
        </body>
    </html>
    `;

    assert(mapUrl);
    return (
        <WebView
            testID="map-webview"
            originWhitelist={['*']}
            source={{ html }}
            style={{ width: '100%', height: '100%' }}
            onLoadStart={() => logger.info('WebView started loading the map embed.', { mapUrl })}
            onLoadEnd={() => logger.info('WebView finished loading the map embed.', { mapUrl })}
            onError={(syntheticEvent): void => {
                const { nativeEvent } = syntheticEvent;
                assert(nativeEvent, "syntheticEvent does not have nativeEvent");
                logger.info('WebView error occurred while loading the map embed.', nativeEvent);
            }}
            onMessage={(event: WebViewMessageEvent) => {
                assert(event.nativeEvent.data, "message does not have event.nativeEvent.data");
                logger.info('Message received from WebView:', event.nativeEvent.data);
            }}
        />
    );
}
