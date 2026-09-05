import {
  EVENT_ROWS,
  createLegacyEventRows,
  isDeathEventLabel,
  isSelfDestructLabel,
} from "./eventRows";

describe("event rows", () => {
  test("includes self-destruct and chain-death in the fixed rows", () => {
    expect(EVENT_ROWS.map((eventRow) => eventRow.label)).toEqual([
      "追放", "殺害", "爆発", "医者", "対立", "ﾗｲﾝ", "自爆", "道連れ",
    ]);
    expect(isDeathEventLabel("自爆")).toBe(true);
    expect(isDeathEventLabel("道連れ")).toBe(true);
    expect(isSelfDestructLabel("自爆")).toBe(true);
  });

  test("keeps legacy rows compatible with the current table", () => {
    const rows = createLegacyEventRows({ role: 1 });
    expect(rows.find((row) => row.name[0] === "爆発").role).toEqual([["ボマー", 3, 1]]);
    expect(rows.find((row) => row.name[0] === "道連れ")).toMatchObject({ id: -8, keyid: -8 });
  });
});
