import { createInitialTutorialBoardState, TUTORIAL_PLAYER_NAMES } from "./initialBoard";

test("builds the tutorial board with current event rows while retaining tutorial event cells", () => {
  const tutorialRows = [
    { id: 0, keyid: 0, name: ["名前例", 19] },
    { id: -1, keyid: -1, name: ["追放", 19], target_day1: [["アリス", 0, 2]] },
    { id: -2, keyid: -2, name: ["削除済みイベント", 19] },
  ];
  const eventRows = [
    { id: -1, keyid: -1, name: ["追放", 19] },
    { id: -3, keyid: -3, name: ["自爆", 19] },
  ];

  const state = createInitialTutorialBoardState({ tutorialRows, eventRows });

  expect(state.playerNames).toEqual(TUTORIAL_PLAYER_NAMES);
  expect(state.isTutorial).toBe(true);
  expect(state.dayCount).toBe(2);
  expect(state.board).toEqual([
    tutorialRows[0],
    eventRows[0] && { ...tutorialRows[1], id: -1, keyid: -1 },
    eventRows[1],
  ]);
});
