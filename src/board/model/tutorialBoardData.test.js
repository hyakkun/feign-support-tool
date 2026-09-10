import { TUTORIAL_ROWS } from "./tutorialBoardData";
import { createLegacyEventRows } from "./eventRows";

test("keeps the tutorial players and event examples as static board data", () => {
  const playerRows = TUTORIAL_ROWS.filter((row) => row.id >= 0);
  const exileRow = TUTORIAL_ROWS.find((row) => row.name[0] === "追放");
  const selfDestructRow = TUTORIAL_ROWS.find((row) => row.name[0] === "自爆");

  expect(playerRows.map((row) => row.name[0])).toEqual([
    "名前例", "名前は", "最初に", "ページ下部", "入力欄に", "改行区切り",
    "で入力", "setName", "で設定", "詳細は", "入力欄横", "使い方参照",
  ]);
  expect(exileRow.target_day1).toEqual([["入力欄に", 0, 2]]);
  expect(TUTORIAL_ROWS.filter((row) => row.id < 0).map((row) => row.name[0])).toEqual(
    createLegacyEventRows({ role: 1 }).map((row) => row.name[0]),
  );
  expect(selfDestructRow).toMatchObject({ id: -5, keyid: -5 });
});
