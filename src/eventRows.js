export const EVENT_TYPE = Object.freeze({
  EXILE: "exile",
  KILL: "kill",
  EXPLOSION: "explosion",
  DOCTOR: "doctor",
  CONFLICT: "conflict",
  LINE: "line",
  SELF_DESTRUCT: "self-destruct",
  CHAIN_DEATH: "chain-death",
});

const eventRows = [
  { type: EVENT_TYPE.EXILE, label: "追放", editor: "player-then-optional-dead-role" },
  { type: EVENT_TYPE.KILL, label: "殺害", editor: "player-then-optional-dead-role" },
  { type: EVENT_TYPE.EXPLOSION, label: "爆発", editor: "player-or-revive", role: ["ボマー", 3] },
  { type: EVENT_TYPE.CHAIN_DEATH, label: "道連れ", editor: "player-then-optional-dead-role" },
  { type: EVENT_TYPE.SELF_DESTRUCT, label: "自爆", editor: "player-with-fixed-dead-role", fixedDeathRoleId: "magician" },
  { type: EVENT_TYPE.DOCTOR, label: "医者", editor: "player-or-revive", role: ["医者", 1] },
  { type: EVENT_TYPE.CONFLICT, label: "対立", editor: "freeform" },
  { type: EVENT_TYPE.LINE, label: "ﾗｲﾝ", editor: "freeform" },
];

export const EVENT_ROWS = Object.freeze(eventRows.map((eventRow) => Object.freeze({ ...eventRow })));

export const isDeathEventLabel = (label) => EVENT_ROWS.some((eventRow) => (
  eventRow.label === label && ["player-then-optional-dead-role", "player-with-fixed-dead-role"].includes(eventRow.editor)
));

export const fixedDeathRoleIdForEventLabel = (label) => EVENT_ROWS.find((eventRow) => (
  eventRow.label === label
))?.fixedDeathRoleId;

const popupEventLabels = new Set([
  EVENT_ROWS.find((eventRow) => eventRow.type === EVENT_TYPE.SELF_DESTRUCT).label,
  EVENT_ROWS.find((eventRow) => eventRow.type === EVENT_TYPE.CHAIN_DEATH).label,
]);

const playerNamesInCell = (cell) => (cell || [])
  .filter((item) => Array.isArray(item) && item[2] === 2)
  .map((item) => item[0]);

export const popupEventsByPlayerName = (tableData, day) => {
  const playerEvents = {};
  tableData
    .filter((row) => popupEventLabels.has(row.name?.[0]))
    .forEach((row) => {
      const eventLabel = row.name[0];
      const targets = [
        ...playerNamesInCell(row[`target_day${day}`]),
        ...playerNamesInCell(row[`action_day${day}`]),
      ];
      targets.forEach((target) => {
        if (!playerEvents[target]) playerEvents[target] = [];
        if (!playerEvents[target].includes(eventLabel)) playerEvents[target].push(eventLabel);
      });
    });
  return playerEvents;
};

export const createLegacyEventRows = (actionType) => EVENT_ROWS.map((eventRow, index) => {
  const row = {
    keyid: -(index + 1),
    id: -(index + 1),
    name: [eventRow.label, 19],
  };
  if (eventRow.role) row.role = [[...eventRow.role, actionType.role]];
  return row;
});
