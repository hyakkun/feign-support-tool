import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

jest.mock("../board/table/BoardTable", () => {
  const React = require("react");
  return {
    BoardTable: ({ data, columns, onCellSave }) => {
      const firstPlayer = data.find((row) => row.id >= 0);
      const colorColumn = columns.find((column) => column.dataField === "color");
      const selfDestructRow = data.find((row) => row.name[0] === "自爆");
      const currentTargetColumn = columns.find((column) => column.dataField === "target_day2");
      const currentActionColumn = columns.find((column) => column.dataField === "action_day2");
      return (
        <>
          <output data-testid="player-names">
            {data.filter((row) => row.id >= 0).map((row) => row.name[0]).join(",")}
          </output>
          <output data-testid="first-player-color">{firstPlayer?.color?.[1] || ""}</output>
          <output data-testid="first-player-dead-role">{firstPlayer?.deadRole?.map((role) => role[0]).join(",") || ""}</output>
          <output data-testid="first-player-action">{firstPlayer?.action_day2?.map((item) => item[0]).join(",") || ""}</output>
          <button onClick={() => onCellSave(firstPlayer.color, ["/icon/test.png", "#123456"], firstPlayer, colorColumn)}>
            色を変更
          </button>
          <button onClick={() => onCellSave(selfDestructRow.target_day2 || [], [[firstPlayer.name[0], 0, 2]], selfDestructRow, currentTargetColumn)}>
            自爆を記録
          </button>
          <button onClick={() => onCellSave(firstPlayer.action_day2 || [], [["トラッカ", 1, 1]], firstPlayer, currentActionColumn)}>
            行動を記録
          </button>
        </>
      );
    },
  };
});

import { FeignSupportToolRoot } from "./FeignSupportToolRoot";

const createPopupWindow = () => ({
  closed: false,
  document: { readyState: "complete" },
  postMessage: jest.fn(),
});

describe("FeignSupportToolRoot integration", () => {
  let popupWindow;
  let openSpy;
  let confirmSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    popupWindow = createPopupWindow();
    openSpy = jest.spyOn(window, "open").mockReturnValue(popupWindow);
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    openSpy.mockRestore();
    confirmSpy.mockRestore();
    jest.useRealTimers();
  });

  test("updates the rendered board and popup snapshot after setting participant names", () => {
    render(<FeignSupportToolRoot />);

    fireEvent.click(screen.getByText("openDisplayWindow"));
    act(() => jest.runOnlyPendingTimers());
    expect(popupWindow.postMessage).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByPlaceholderText(/名前入力欄/), { target: { value: "アリス\nボブ" } });
    fireEvent.click(screen.getByText("setName"));

    expect(screen.getByTestId("player-names")).toHaveTextContent("アリス,ボブ");
    expect(popupWindow.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({
      day: 1,
      tableData: expect.arrayContaining([
        expect.objectContaining({ name: ["アリス", 19] }),
        expect.objectContaining({ name: ["ボブ", 19] }),
      ]),
      colorNameDic: {},
    }), window.location.origin);
  });

  test("sends the initial board snapshot when resetting an open popup", () => {
    render(<FeignSupportToolRoot />);

    fireEvent.click(screen.getByText("openDisplayWindow"));
    act(() => jest.runOnlyPendingTimers());
    fireEvent.change(screen.getByPlaceholderText(/名前入力欄/), { target: { value: "アリス\nボブ" } });
    fireEvent.click(screen.getByText("setName"));
    fireEvent.click(screen.getByText("リセット"));

    expect(confirmSpy).toHaveBeenCalledWith("入力内容をリセットしますか？");
    expect(screen.getByTestId("player-names")).toHaveTextContent("アリス,ボブ");
    expect(popupWindow.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({
      day: 1,
      tableData: expect.arrayContaining([
        expect.objectContaining({ name: ["アリス", 19] }),
        expect.objectContaining({ name: ["ボブ", 19] }),
      ]),
    }), window.location.origin);
  });

  test("keeps a color change synchronized between the board and an open popup", () => {
    render(<FeignSupportToolRoot />);

    fireEvent.click(screen.getByText("openDisplayWindow"));
    act(() => jest.runOnlyPendingTimers());
    fireEvent.click(screen.getByText("色を変更"));

    expect(screen.getByTestId("first-player-color")).toHaveTextContent("#123456");
    expect(popupWindow.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({
      colorNameDic: expect.objectContaining({ 名前例: ["/icon/test.png", "#123456"] }),
      tableData: expect.arrayContaining([
        expect.objectContaining({ name: ["名前例", 19], color: ["/icon/test.png", "#123456"] }),
      ]),
    }), window.location.origin);
  });

  test("records the magician death role when saving a self-destruct event", () => {
    render(<FeignSupportToolRoot />);

    fireEvent.click(screen.getByText("openDisplayWindow"));
    act(() => jest.runOnlyPendingTimers());
    fireEvent.click(screen.getByText("自爆を記録"));

    expect(screen.getByTestId("first-player-dead-role")).toHaveTextContent("魔術師");
    expect(popupWindow.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({
      playerEvents: expect.objectContaining({ 名前例: ["自爆"] }),
      tableData: expect.arrayContaining([
        expect.objectContaining({ name: ["名前例", 19], deadRole: [["魔術師", 3, 1]] }),
        expect.objectContaining({ name: ["自爆", 19], target_day2: [["名前例", 0, 2]] }),
      ]),
    }), window.location.origin);
  });

  test("saves a role-select result through the root reducer and popup snapshot", () => {
    render(<FeignSupportToolRoot />);

    fireEvent.click(screen.getByText("openDisplayWindow"));
    act(() => jest.runOnlyPendingTimers());
    fireEvent.click(screen.getByText("行動を記録"));

    expect(screen.getByTestId("first-player-action")).toHaveTextContent("トラッカ");
    expect(popupWindow.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({
      day: 2,
      tableData: expect.arrayContaining([
        expect.objectContaining({ name: ["名前例", 19], action_day2: [["トラッカ", 1, 1]] }),
      ]),
    }), window.location.origin);
  });
});
