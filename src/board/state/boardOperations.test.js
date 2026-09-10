import { createMemoRow, nextDayNumber, resetTableData } from "./boardOperations";

test("creates board operation data without changing existing rows", () => {
  const rows = [{ id: 0, keyid: 0, name: ["アリス", 19] }, { id: -8, keyid: -8, name: ["メモ", 19] }];
  expect(nextDayNumber(new Array(6))).toBe(2);
  expect(createMemoRow(rows)).toEqual({ id: -9, keyid: -9, name: ["メモ", 19] });
  expect(resetTableData([{ ...rows[0], color: ["yellow", "#ffe"] }], [{ id: -1, keyid: -1, name: ["追放", 19] }])).toEqual([
    { id: 0, keyid: 0, name: ["アリス", 19], color: ["yellow", "#ffe"] },
    { id: -1, keyid: -1, name: ["追放", 19] },
  ]);
});
