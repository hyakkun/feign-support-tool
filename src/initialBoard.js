import { createBoardState } from "./boardState";

export const TUTORIAL_PLAYER_NAMES = Object.freeze([
  "名前例", "最初に", "名前は", "ページ下部", "入力欄に", "改行区切り",
  "で入力", "setName", "で設定", "詳細は", "入力欄横", "使い方参照",
]);

export const createInitialTutorialBoardState = ({ tutorialRows, eventRows }) => {
  const tutorialEventsByLabel = new Map(tutorialRows
    .filter((row) => row.id < 0)
    .map((row) => [row.name[0], row]));
  const board = tutorialRows
    .filter((row) => row.id >= 0)
    .concat(eventRows.map((eventRow) => ({
      ...(tutorialEventsByLabel.get(eventRow.name[0]) || eventRow),
      keyid: eventRow.keyid,
      id: eventRow.id,
    })));

  return createBoardState({
    board,
    playerNames: TUTORIAL_PLAYER_NAMES,
    isTutorial: true,
    dayCount: 2,
  });
};
