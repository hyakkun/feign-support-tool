import { createDayColumnDefinitions } from "./dayColumnDefinitions";

test("creates editable target and action column definitions from shared dependencies", () => {
  const columnTemplate = { sort: true, editable: true, sortFunc: jest.fn() };
  const definitions = createDayColumnDefinitions({
    config: { actionRevive: { name: "蘇生" }, role: [], actionResult: [], hr: {}, fixedDeathRoleForEvent: jest.fn() },
    runtime: { getPlayerOptions: jest.fn(() => []) },
    columnTemplate,
  });

  expect(definitions.targetDay).toMatchObject(columnTemplate);
  expect(definitions.actionDay).toMatchObject({ ...columnTemplate, text: "　" });
  expect(definitions.targetDay.editorRenderer).toEqual(expect.any(Function));
  expect(definitions.actionDay.editorRenderer).toEqual(expect.any(Function));
});
