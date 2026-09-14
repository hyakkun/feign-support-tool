import { popupEventsByPlayerName } from "../model/eventRows";
import { createLegacyPlayerOptions } from "../model/playerRows";

export const createBoardState = ({ board, playerNames, display, isTutorial = false, dayCount = 1 }) => ({
  board,
  playerNames,
  display: { playerIsIcon: true, nameIsIcon: true, ...display },
  isTutorial,
  dayCount,
});

export const selectTableData = (state) => state.board;

export const selectColorByPlayerName = (state) => state.board.reduce((colors, row) => (
  row.id >= 0 && row.color ? { ...colors, [row.name[0]]: row.color } : colors
), {});

export const selectPlayerOptions = (state, actionType) => (
  createLegacyPlayerOptions(state.playerNames, actionType.name)
);

export const selectTableColumns = (state, tableDefinition) => {
  const dayColumns = Array.from({ length: state.dayCount }, (_, index) => {
    const day = index + 1;
    return [
      {
        ...tableDefinition.targetDay,
        formatter: tableDefinition.deadFormatter(`target_day${day}`),
        text: `${day}`,
        dataField: `target_day${day}`,
      },
      {
        ...tableDefinition.actionDay,
        formatter: tableDefinition.deadFormatter(`action_day${day}`),
        dataField: `action_day${day}`,
      },
    ];
  }).flat();
  const baseColumns = state.isTutorial
    ? tableDefinition.tutorialBaseColumns
    : tableDefinition.playerBaseColumns;
  return [...baseColumns, ...dayColumns];
};

export const selectPopupSnapshot = (state, day) => {
  const playerEventsByDay = Object.fromEntries(
    Array.from({ length: day }, (_, index) => {
      const eventDay = index + 1;
      return [eventDay, popupEventsByPlayerName(state.board, eventDay)];
    }),
  );

  return {
    tableData: selectTableData(state),
    colorNameDic: selectColorByPlayerName(state),
    playerEvents: playerEventsByDay[day],
    playerEventsByDay,
    day,
  };
};
