import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchBar from "../search-bar";

// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    debug: jest.fn(),
  }));
  

describe("SearchBar unit tests", () => {
  it("renders placeholder", () => {
    const { getByPlaceholderText } = render(
      <SearchBar placeholder="Custom" isTesting={true} />
    );
    const input = getByPlaceholderText("Custom");
    expect(input).toBeTruthy();
  });

  it("calls onChangeText when text changes", () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onChangeText={onChangeTextMock} isTesting={true} />
    );
    const input = getByPlaceholderText("Search");
    fireEvent.changeText(input, "Hello");
    expect(onChangeTextMock).toHaveBeenCalledWith("Hello");
  });

  it("calls onSubmitEditing with current text", () => {
    const onSubmitEditingMock = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSubmitEditing={onSubmitEditingMock} isTesting={true} />
    );
    const input = getByPlaceholderText("Search");
    fireEvent.changeText(input, "SubmitTest");
    fireEvent(input, "submitEditing");
    expect(onSubmitEditingMock).toHaveBeenCalledWith("SubmitTest");
  });

  it("usesc value", () => {
    const { getByDisplayValue } = render(
      <SearchBar value="ProvidedValue" isTesting={true} />
    );
    const input = getByDisplayValue("ProvidedValue");
    expect(input).toBeTruthy();
  });
});
