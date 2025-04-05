import React from "react";
import { render } from "@testing-library/react-native";
import { WebView } from "react-native-webview";
import MapEmbed from "../map";
import { InvalidArgumentError } from "../../utils/ErrorTypes";
import logger from "../../utils/logger";

// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("react-native-webview", () => {
  const React = require("react");
  const { View } = require("react-native");
  const WebViewMock = (props: any) => <View {...props} />;
  return { WebView: WebViewMock };
});

describe("Unit tests for MapEmbed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("throws error when no location is provided", () => {
    expect(() => render(<MapEmbed />)).toThrow(InvalidArgumentError);
  });

  test("renders correctly with name and address", () => {
    const clinicName = "Test Clinic";
    const clinicAddress = "123 Test Street";
    const { getByTestId } = render(
      <MapEmbed name={clinicName} address={clinicAddress} />
    );

    const webView = getByTestId("map-webview");

    const source = webView.props.source;
    expect(source).toHaveProperty("html");
    expect(source.html).toContain(
      `https://maps.google.com/maps?q=${encodeURIComponent(
        `${clinicName} ${clinicAddress}`
      )}`
    );
  });

  test("renders correctly with latitude and longitude", () => {
    const latitude = 40;
    const longitude = -74;
    const { getByTestId } = render(
      <MapEmbed latitude={latitude} longitude={longitude} />
    );
    const webView = getByTestId("map-webview");
    const source = webView.props.source;
    expect(source.html).toContain(
      `https://maps.google.com/maps?q=${latitude},${longitude}`
    );
  });
});
