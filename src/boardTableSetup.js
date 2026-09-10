import { createBoardConfig } from "./boardConfig";
import { createLegacyRoleToken } from "./roleCatalog";
import { fixedDeathRoleIdForEventLabel } from "./eventRows";
import { createBoardTableFormatters } from "./boardTableFormatters";
import { createLegacyBoardRuntime } from "./legacyBoardRuntime";
import { sortCellItems } from "./boardColumnSorts";
import { createDayColumnDefinitions } from "./dayColumnDefinitions";
import { createIdentityColumnDefinitions } from "./identityColumnDefinitions";
import { createRoleColumnDefinitions } from "./roleColumnDefinitions";

export const createBoardTableSetup = ({ publicUrl, initialState }) => {
  const config = createBoardConfig(publicUrl);
  config.fixedDeathRoleForEvent = (eventLabel) => {
    const roleId = fixedDeathRoleIdForEventLabel(eventLabel);
    return roleId ? createLegacyRoleToken(roleId, config.actionType) : undefined;
  };

  const runtime = createLegacyBoardRuntime({ initialState, actionType: config.actionType });
  config.getColorNameDictionary = () => runtime.getColorNameDictionary();
  config.getTableData = () => runtime.getTableData();
  config.getPlayerOptions = () => runtime.getPlayerOptions();

  const columnTemplate = { sort: true, sortFunc: sortCellItems, editable: true };
  const formatters = createBoardTableFormatters({
    ...config,
    getColorNameDictionary: () => runtime.getColorNameDictionary(),
    getPlayerIsIcon: () => runtime.getPlayerIsIcon(),
  });
  const dayColumns = createDayColumnDefinitions({ config, runtime, columnTemplate });
  const identityColumns = createIdentityColumnDefinitions({ config, runtime });
  const roleColumns = createRoleColumnDefinitions({ config, columnTemplate, formatters });
  const defaultColumns = [
    ...identityColumns,
    ...roleColumns,
    { ...dayColumns.targetDay, formatter: formatters.deathFormatter("target_day1"), text: "1", dataField: "target_day1" },
    { ...dayColumns.actionDay, formatter: formatters.deathFormatter("action_day1"), dataField: "action_day1" },
  ];
  const tutorialBaseColumns = defaultColumns.slice(0, -2);
  const playerBaseColumns = tutorialBaseColumns.map((column, index) => (
    index === 1 ? { ...column, text: "名前" } : column
  ));

  return {
    config,
    runtime,
    tableDefinition: {
      tutorialBaseColumns,
      playerBaseColumns,
      targetDay: dayColumns.targetDay,
      actionDay: dayColumns.actionDay,
      deadFormatter: formatters.deathFormatter,
    },
  };
};
