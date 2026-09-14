import { createBoardState } from "./boardState";
import { createLegacyBoardRuntime } from "./legacyBoardRuntime";

test("derives legacy table values from the synchronized board state", () => {
  const initialState = createBoardState({
    board: [{ id: 0, keyid: 0, name: ["アリス", 19], color: ["yellow", "#ffe352"] }],
    playerNames: ["アリス"],
  });
  const runtime = createLegacyBoardRuntime({ initialState, actionType: { name: 2 } });
  const colorHandler = vi.fn();
  runtime.setColorChangeHandler(colorHandler);

  expect(runtime.getTableData()).toBe(initialState.board);
  expect(runtime.getColorNameDictionary()).toEqual({ "アリス": ["yellow", "#ffe352"] });
  expect(runtime.getPlayerOptions()).toHaveLength(2);
  expect(runtime.getPlayerIsIcon()).toBe(true);
  expect(runtime.getNameIsIcon()).toBe(true);
  runtime.handleColorChange("アリス", ["blue", "#4b6fd7"]);
  expect(colorHandler).toHaveBeenCalledWith("アリス", ["blue", "#4b6fd7"]);

  runtime.sync(createBoardState({ board: [], playerNames: [], display: { playerIsIcon: false, nameIsIcon: false } }));
  expect(runtime.getTableData()).toEqual([]);
  expect(runtime.getPlayerIsIcon()).toBe(false);
  expect(runtime.getNameIsIcon()).toBe(false);
});
