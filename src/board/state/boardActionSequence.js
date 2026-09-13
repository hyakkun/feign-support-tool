import { BOARD_ACTION, boardReducer } from "./boardReducer";
import { deathRoleRecordsFromEventCell, isDeathEventLabel } from "../model/eventRows";

export const applyBoardActions = (state, actions) => actions.reduce(boardReducer, state);

export const createCellSaveActions = ({ row, column, value, actionType, fixedDeathRoleForEvent }) => {
  const deathRoleActions = isDeathEventLabel(row.name[0])
    ? deathRoleRecordsFromEventCell(row.name[0], value, actionType).map((record) => ({
      type: BOARD_ACTION.RECORD_DEATH_ROLE,
      playerName: record.playerName,
      roleToken: record.roleToken || fixedDeathRoleForEvent(row.name[0]),
      preventDuplicate: Boolean(record.fixedDeathRoleId),
    }))
    : [];
  return [
    { type: BOARD_ACTION.UPDATE_CELL, rowId: row.id, field: column.dataField, value },
    ...deathRoleActions,
  ];
};
