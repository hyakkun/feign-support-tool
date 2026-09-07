import { BOARD_ACTION, boardReducer } from "./boardReducer";
import { createBoardState } from "./boardState";

test("updates display settings and board operations without mutating prior state", () => {
  const state = createBoardState({ board: [{ id: 0, keyid: 0, name: ["アリス", 19] }], playerNames: ["アリス"], dayCount: 1 });
  const iconsOff = boardReducer(state, { type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "playerIsIcon", value: false });
  const nextDay = boardReducer(iconsOff, { type: BOARD_ACTION.ADD_DAY });
  const withMemo = boardReducer(nextDay, { type: BOARD_ACTION.ADD_MEMO_ROW });

  expect(state.display.playerIsIcon).toBe(true);
  expect(iconsOff.display.playerIsIcon).toBe(false);
  expect(nextDay.dayCount).toBe(2);
  expect(withMemo.board.at(-1)).toEqual({ id: -1, keyid: -1, name: ["メモ", 19] });
});

test("initializes a non-tutorial board with its own player list", () => {
  const tutorial = createBoardState({
    board: [{ id: 0, keyid: 0, name: ["名前例", 19] }],
    playerNames: ["名前例"],
    isTutorial: true,
    dayCount: 2,
  });
  const initialized = boardReducer(tutorial, {
    type: BOARD_ACTION.INITIALIZE_BOARD,
    playerNames: ["アリス", "ボブ"],
    eventRows: [{ id: -1, keyid: -1, name: ["追放", 19] }],
  });

  expect(initialized).toMatchObject({ playerNames: ["アリス", "ボブ"], isTutorial: false, dayCount: 1 });
  expect(initialized.board.map((row) => row.name[0])).toEqual(["アリス", "ボブ", "追放"]);
  expect(tutorial.playerNames).toEqual(["名前例"]);
});

test("reconciles player names and stores colors on player rows", () => {
  const state = createBoardState({
    board: [
      { id: 0, keyid: 0, name: ["アリス", 19], role: [["医者", 1, 1]] },
      { id: -1, keyid: -1, name: ["追放", 19] },
    ],
    playerNames: ["アリス"],
  });
  const renamed = boardReducer(state, { type: BOARD_ACTION.SET_PLAYER_NAMES, playerNames: ["アリス", "ボブ"] });
  const colored = boardReducer(renamed, { type: BOARD_ACTION.SET_PLAYER_COLOR, playerName: "アリス", color: ["yellow", "#ffe352"] });

  expect(renamed.playerNames).toEqual(["アリス", "ボブ"]);
  expect(renamed.board[0].role).toEqual([["医者", 1, 1]]);
  expect(renamed.board[1].name).toEqual(["ボブ", 19]);
  expect(colored.board[0].color).toEqual(["yellow", "#ffe352"]);
});

test("updates cells and records manual or fixed death roles", () => {
  const state = createBoardState({ board: [{ id: 0, keyid: 0, name: ["アリス", 19] }], playerNames: ["アリス"] });
  const updated = boardReducer(state, { type: BOARD_ACTION.UPDATE_CELL, rowId: 0, field: "action_day1", value: [["成功", 0, 0]] });
  const manual = boardReducer(updated, { type: BOARD_ACTION.RECORD_DEATH_ROLE, playerName: "アリス", roleToken: ["医者", 1, 1] });
  const fixed = boardReducer(manual, { type: BOARD_ACTION.RECORD_DEATH_ROLE, playerName: "アリス", roleToken: ["魔術師", 3, 1], preventDuplicate: true });
  const repeatedFixed = boardReducer(fixed, { type: BOARD_ACTION.RECORD_DEATH_ROLE, playerName: "アリス", roleToken: ["魔術師", 3, 1], preventDuplicate: true });

  expect(updated.board[0].action_day1).toEqual([["成功", 0, 0]]);
  expect(manual.board[0].deadRole).toEqual([["医者", 1, 1]]);
  expect(repeatedFixed.board[0].deadRole).toEqual([["医者", 1, 1], ["魔術師", 3, 1]]);
});

test("can replace transitional state after a legacy table edit", () => {
  const state = createBoardState({ board: [], playerNames: [] });
  const replacement = { ...state, board: [{ id: -1, keyid: -1, name: ["メモ", 19], action_day1: [["記録", 0, 3]] }] };
  expect(boardReducer(state, { type: BOARD_ACTION.REPLACE_STATE, state: replacement })).toBe(replacement);
});

test("resets the board through a reducer action while retaining colors", () => {
  const state = createBoardState({ board: [{ id: 0, keyid: 0, name: ["アリス", 19], color: ["yellow", "#ffe"], role: [["医者", 1, 1]] }], playerNames: ["アリス"] });
  const reset = boardReducer(state, { type: BOARD_ACTION.RESET_BOARD, eventRows: [{ id: -1, keyid: -1, name: ["追放", 19] }] });
  expect(reset.board).toEqual([{ id: 0, keyid: 0, name: ["アリス", 19], color: ["yellow", "#ffe"] }, { id: -1, keyid: -1, name: ["追放", 19] }]);
});
