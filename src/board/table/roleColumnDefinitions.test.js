import { createRoleColumnDefinitions } from "./roleColumnDefinitions";

test("creates role and dead-role columns with shared editor settings", () => {
  const columns = createRoleColumnDefinitions({
    config: { role: [], br: {} },
    columnTemplate: { editable: true, sort: true },
    formatters: { cellFormatter: jest.fn(() => jest.fn()) },
  });

  expect(columns.map((column) => column.dataField)).toEqual(["role", "deadRole"]);
  expect(columns.every((column) => column.editable)).toBe(true);
});
