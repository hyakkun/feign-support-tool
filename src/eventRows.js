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
  { type: EVENT_TYPE.SELF_DESTRUCT, label: "自爆", editor: "player-then-optional-dead-role" },
  { type: EVENT_TYPE.DOCTOR, label: "医者", editor: "player-or-revive", role: ["医者", 1] },
  { type: EVENT_TYPE.CONFLICT, label: "対立", editor: "freeform" },
  { type: EVENT_TYPE.LINE, label: "ﾗｲﾝ", editor: "freeform" },
];

export const EVENT_ROWS = Object.freeze(eventRows.map((eventRow) => Object.freeze({ ...eventRow })));

export const isDeathEventLabel = (label) => EVENT_ROWS.some((eventRow) => (
  eventRow.label === label && eventRow.editor === "player-then-optional-dead-role"
));

export const createLegacyEventRows = (actionType) => EVENT_ROWS.map((eventRow, index) => {
  const row = {
    keyid: -(index + 1),
    id: -(index + 1),
    name: [eventRow.label, 19],
  };
  if (eventRow.role) row.role = [[...eventRow.role, actionType.role]];
  return row;
});
