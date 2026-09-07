import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NameInputPanel } from "./NameInputPanel";

test("forwards name, display, and toolbar actions through props", () => {
  const props = {
    nameText: "アリス",
    onNameTextChange: jest.fn(),
    onOpenPopup: jest.fn(),
    playerIsIcon: true,
    nameIsIcon: true,
    onPlayerIconChange: jest.fn(),
    onNameIconChange: jest.fn(),
    onSetNames: jest.fn(),
    onReset: jest.fn(),
  };
  render(<NameInputPanel {...props} />);

  fireEvent.change(screen.getByPlaceholderText(/名前入力欄/), { target: { value: "ボブ" } });
  fireEvent.click(screen.getByLabelText("アイコン"));
  fireEvent.click(screen.getByLabelText("名前欄アイコン"));
  fireEvent.click(screen.getByText("openDisplayWindow"));
  fireEvent.click(screen.getByText("setName"));
  fireEvent.click(screen.getByText("リセット"));

  expect(props.onNameTextChange).toHaveBeenCalledTimes(1);
  expect(props.onPlayerIconChange).toHaveBeenCalledTimes(1);
  expect(props.onNameIconChange).toHaveBeenCalledTimes(1);
  expect(props.onOpenPopup).toHaveBeenCalledTimes(1);
  expect(props.onSetNames).toHaveBeenCalledTimes(1);
  expect(props.onReset).toHaveBeenCalledTimes(1);
});
