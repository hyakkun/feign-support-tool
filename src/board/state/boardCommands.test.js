import { BOARD_ACTION } from "./boardReducer";
import { addDay, addMemoRow, initializeBoard, resetBoard, setDisplayOption, setPlayerNames } from "./boardCommands";

test("creates board command actions", () => {
  expect(initializeBoard(["アリス"], [])).toMatchObject({ type: BOARD_ACTION.INITIALIZE_BOARD, playerNames: ["アリス"] });
  expect(setPlayerNames(["ボブ"])).toEqual({ type: BOARD_ACTION.SET_PLAYER_NAMES, playerNames: ["ボブ"] });
  expect(resetBoard([])).toEqual({ type: BOARD_ACTION.RESET_BOARD, eventRows: [] });
  expect(addDay()).toEqual({ type: BOARD_ACTION.ADD_DAY });
  expect(addMemoRow()).toEqual({ type: BOARD_ACTION.ADD_MEMO_ROW });
  expect(setDisplayOption("nameIsIcon", false)).toEqual({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "nameIsIcon", value: false });
});
