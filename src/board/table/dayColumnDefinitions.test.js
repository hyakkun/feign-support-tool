import { createDayColumnDefinitions } from "./dayColumnDefinitions";

test("creates editable target and action column definitions from shared dependencies", () => {
  const columnTemplate = { sort: true, editable: true, sortFunc: vi.fn() };
  const definitions = createDayColumnDefinitions({
    config: { actionRevive: { name: "蘇生" }, role: [], actionResult: [], hr: {}, fixedDeathRoleForEvent: vi.fn() },
    runtime: { getPlayerOptions: vi.fn(() => []) },
    columnTemplate,
  });

  expect(definitions.targetDay).toMatchObject(columnTemplate);
  expect(definitions.actionDay).toMatchObject({ ...columnTemplate, text: "　" });
  expect(definitions.targetDay.editorRenderer).toEqual(expect.any(Function));
  expect(definitions.actionDay.editorRenderer).toEqual(expect.any(Function));
});
