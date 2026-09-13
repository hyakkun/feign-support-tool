import { useCallback } from "react";
import { addDay, addMemoRow, setDisplayOption } from "../boardCommands";

export const useBoardToolbarActions = ({ applyAction, sendPopup }) => ({
  onAddDay: useCallback(() => { const state = applyAction(addDay()); sendPopup(state.dayCount, state); }, [applyAction, sendPopup]),
  onAddMemo: useCallback(() => { const state = applyAction(addMemoRow()); sendPopup(state.dayCount, state); }, [applyAction, sendPopup]),
  onPlayerIconChange: useCallback((event) => applyAction(setDisplayOption("playerIsIcon", event.target.checked)), [applyAction]),
  onNameIconChange: useCallback((event) => applyAction(setDisplayOption("nameIsIcon", event.target.checked)), [applyAction]),
});
