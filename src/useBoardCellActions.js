import { useCallback } from "react";
import { BOARD_ACTION } from "./boardReducer";
import { createCellSaveActions } from "./boardActionSequence";

export const useBoardCellActions = ({ applyAction, applyActions, config, hasPopup, sendPopup, setTableRevision }) => {
  const onColorChange = useCallback((playerName, color) => {
    applyAction({ type: BOARD_ACTION.SET_PLAYER_COLOR, playerName, color });
    setTableRevision((value) => value + 1);
  }, [applyAction, setTableRevision]);

  const onCellSave = useCallback((oldValue, newValue, row, column) => {
    const nextState = applyActions(createCellSaveActions({
      row, column, value: newValue, actionType: config.actionType,
      fixedDeathRoleForEvent: config.fixedDeathRoleForEvent,
    }));
    if (hasPopup()) sendPopup(nextState.dayCount, nextState);
    if (column.dataField === "name" || row.id < 0) setTableRevision((value) => value + 1);
  }, [applyActions, config, hasPopup, sendPopup, setTableRevision]);

  return { onColorChange, onCellSave };
};
