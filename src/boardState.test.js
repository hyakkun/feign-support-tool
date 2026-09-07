import { createBoardState, selectColorByPlayerName, selectPlayerOptions, selectPopupSnapshot, selectTableData } from "./boardState";

const board = [
  { id: 0, keyid: 0, name: ["アリス", 19], color: ["yellow", "#ffe352"] },
  { id: -5, keyid: -5, name: ["自爆", 19], target_day1: [["アリス", 0, 2]] },
];

test("derives legacy table, options, colors, and popup data from one board state", () => {
  const state = createBoardState({ board, playerNames: ["アリス"], dayCount: 1 });
  expect(selectTableData(state)).toBe(board);
  expect(selectColorByPlayerName(state)).toEqual({ "アリス": ["yellow", "#ffe352"] });
  expect(selectPlayerOptions(state, { name: 2 })).toHaveLength(2);
  expect(selectPopupSnapshot(state, 1)).toMatchObject({
    colorNameDic: { "アリス": ["yellow", "#ffe352"] },
    playerEvents: { "アリス": ["自爆"] },
    day: 1,
  });
});
