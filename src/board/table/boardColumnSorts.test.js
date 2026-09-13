import {
  sortCellItems,
  sortColors,
  sortDeadRoles,
  sortNames,
  sortRoles,
} from "./boardColumnSorts";

const player = (id, extra = {}) => ({ id, ...extra });

describe("board column sorts", () => {
  test("keeps fixed event rows after player rows and in their configured order", () => {
    expect(sortNames(["アリス", 19], ["追放", 19], "asc", "name", player(0), player(-1))).toBe(-1);
    expect(sortNames(["殺害", 19], ["追放", 19], "desc", "name", player(-2), player(-1))).toBe(1);
  });

  test("sorts names by alignment and then label", () => {
    expect(sortNames(["ボブ", 1], ["アリス", 1], "asc", "name", player(0), player(1))).toBeGreaterThan(0);
    expect(sortNames(["アリス", 2], ["ボブ", 1], "asc", "name", player(0), player(1))).toBeGreaterThan(0);
  });

  test("ignores leading result markers for cell and role sorting", () => {
    expect(sortCellItems([["真結果", 5, 4], ["ボマー", 3, 1]], [["医者", 1, 1]], "asc", "role", player(0), player(1))).toBeLessThan(0);
    expect(sortRoles([["真結果", 5, 4]], [["医者", 1, 1]], "asc", "role", player(0, { deadRole: [["ボマー", 3, 1]] }), player(1))).toBeLessThan(0);
  });

  test("uses the complementary role column when one role value is empty", () => {
    expect(sortRoles([], [["医者", 1, 1]], "asc", "role", player(0, { deadRole: [["バカ", 1, 1]] }), player(1))).toBeLessThan(0);
    expect(sortDeadRoles([], [["医者", 1, 1]], "asc", "deadRole", player(0, { role: [["バカ", 1, 1]] }), player(1))).toBeGreaterThan(0);
  });

  test("sorts color values in the selected direction", () => {
    expect(sortColors(["blue", "#00f"], ["red", "#f00"], "asc", "color", player(0), player(1))).toBeLessThan(0);
    expect(sortColors(["blue", "#00f"], ["red", "#f00"], "desc", "color", player(0), player(1))).toBeGreaterThan(0);
  });
});
