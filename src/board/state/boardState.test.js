import { createBoardState, selectColorByPlayerName, selectPlayerOptions, selectPopupSnapshot, selectTableColumns, selectTableData } from "./boardState";

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
    playerEventsByDay: { 1: { "アリス": ["自爆"] } },
    day: 1,
  });
});

test("derives every day column from the board state day count", () => {
  const state = createBoardState({ board: [], playerNames: [], dayCount: 2, isTutorial: false });
  const columns = selectTableColumns(state, {
    tutorialBaseColumns: [{ dataField: "name", text: "名" }],
    playerBaseColumns: [{ dataField: "name", text: "名前" }],
    targetDay: { kind: "target" },
    actionDay: { kind: "action" },
    deadFormatter: (field) => `formatter:${field}`,
  });

  expect(columns).toEqual([
    { dataField: "name", text: "名前" },
    { kind: "target", formatter: "formatter:target_day1", text: "1", dataField: "target_day1" },
    { kind: "action", formatter: "formatter:action_day1", dataField: "action_day1" },
    { kind: "target", formatter: "formatter:target_day2", text: "2", dataField: "target_day2" },
    { kind: "action", formatter: "formatter:action_day2", dataField: "action_day2" },
  ]);
  expect(selectTableColumns({ ...state, isTutorial: true }, {
    tutorialBaseColumns: [{ dataField: "name", text: "名" }],
    playerBaseColumns: [{ dataField: "name", text: "名前" }],
    targetDay: { kind: "target" },
    actionDay: { kind: "action" },
    deadFormatter: (field) => `formatter:${field}`,
  })[0]).toEqual({ dataField: "name", text: "名" });
});
