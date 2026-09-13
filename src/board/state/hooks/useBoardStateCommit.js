import { useCallback } from "react";
import { BOARD_ACTION } from "../boardReducer";
import { applyBoardActions } from "../boardActionSequence";

export const useBoardStateCommit = ({ boardState, data, dispatch, runtime }) => {
  const commitState = useCallback((nextState) => {
    dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
    runtime.sync(nextState);
    return nextState;
  }, [dispatch, runtime]);

  const applyActions = useCallback((actions) => (
    commitState(applyBoardActions({ ...boardState, board: data }, actions))
  ), [boardState, commitState, data]);

  return { commitState, applyActions };
};
