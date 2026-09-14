import { createIdentityColumnDefinitions } from "./identityColumnDefinitions";

test("creates the editable color and name columns", () => {
  const columns = createIdentityColumnDefinitions({
    config: { colorList: [], roleLabel: [], optionbackground: [], insaneRoleLabel: [], allRoleLabel: [] },
    runtime: { getNameIsIcon: vi.fn(), handleColorChange: vi.fn() },
  });

  expect(columns.map((column) => column.dataField)).toEqual(["color", "name"]);
  expect(columns.every((column) => column.editable)).toBe(true);
});
