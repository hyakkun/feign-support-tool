export const FACTION = Object.freeze({
  CREW: "crew",
  IMP: "imp",
  NEUTRAL: "neutral",
});

export const ACTION_ITEM = Object.freeze({
  ROLE: "role",
  PLAYER: "player",
  RESULT: "result",
});

const flexibleFactionLegacy = {
  roletype: [true, true, true, false, true],
  defaultRoletype1: 0,
  defaultRoletype2: 1,
  defaultRoletype3: 2,
};

const roleDefinitions = [
  { id: "snitch", label: "ねずみ", factions: [FACTION.CREW, FACTION.IMP], actionItems: [ACTION_ITEM.ROLE, ACTION_ITEM.RESULT], image: "Snitch.png" },
  { id: "investigator", label: "インベ", factions: [FACTION.CREW, FACTION.IMP], actionItems: [ACTION_ITEM.ROLE, ACTION_ITEM.RESULT], image: "Investigator.png" },
  { id: "police", label: "ポリス", factions: [FACTION.CREW, FACTION.IMP], actionItems: [ACTION_ITEM.RESULT], image: "Police.png" },
  { id: "trapper", label: "トラッパ", factions: [FACTION.CREW, FACTION.IMP], actionItems: [ACTION_ITEM.RESULT, ACTION_ITEM.PLAYER], image: "Trapper.png" },
  { id: "lookout", label: "ルック", factions: [FACTION.CREW, FACTION.IMP], actionItems: [ACTION_ITEM.PLAYER, ACTION_ITEM.RESULT], image: "Lookout.png" },
  { id: "provoker", label: "挑発", factions: [FACTION.CREW, FACTION.IMP], actionItems: [ACTION_ITEM.RESULT], image: "Provoker.png" },
  { id: "doctor", label: "医者", factions: [FACTION.CREW], actionItems: [ACTION_ITEM.RESULT], image: "Doctor.png" },
  { id: "insane", label: "バカ", factions: [FACTION.CREW], actionItems: [ACTION_ITEM.RESULT], image: "Insane.png" },
  { id: "blamer", label: "ブレイマ", factions: [FACTION.IMP], actionItems: [ACTION_ITEM.RESULT], image: "Blamer.png" },
  { id: "cleaner", label: "クリーナ", factions: [FACTION.IMP], actionItems: [ACTION_ITEM.RESULT], image: "Cleaner.png" },
  { id: "serial-killer", label: "シリアル", factions: [FACTION.NEUTRAL], actionItems: [ACTION_ITEM.RESULT], image: "SerialKiller.png" },
  { id: "bomber", label: "ボマー", factions: [FACTION.NEUTRAL], actionItems: [ACTION_ITEM.RESULT], image: "Bomber.png" },
  { id: "thief", label: "シーフ", factions: [FACTION.NEUTRAL], actionItems: [ACTION_ITEM.ROLE, ACTION_ITEM.PLAYER, ACTION_ITEM.RESULT], image: "Thief.png" },
  { id: "survivor", label: "サバイバ", factions: [FACTION.NEUTRAL], actionItems: [ACTION_ITEM.RESULT], image: "Survivor.png" },
];

export const ROLE_CATALOG = Object.freeze(roleDefinitions.map((role) => Object.freeze({ ...role })));

export const ALL_ACTION_ITEMS = Object.freeze([
  ACTION_ITEM.ROLE,
  ACTION_ITEM.PLAYER,
  ACTION_ITEM.RESULT,
]);

export const findRoleByLabel = (label) => ROLE_CATALOG.find((role) => role.label === label);

export const actionItemsForRoleLabels = (labels) => {
  if (!labels.length || labels.includes("？")) return [...ALL_ACTION_ITEMS];

  const actionItems = [];
  labels.forEach((label) => {
    const role = findRoleByLabel(label);
    role?.actionItems.forEach((item) => {
      if (!actionItems.includes(item)) actionItems.push(item);
    });
  });
  return actionItems.length ? actionItems : [...ALL_ACTION_ITEMS];
};

export const createLegacyRoleOptions = (actionType) => ROLE_CATALOG.map((role, index) => {
  const legacy = role.factions.length === 2
    ? flexibleFactionLegacy
    : role.factions[0] === FACTION.CREW
      ? { roletype: [true, true, false, false, true], defaultRoletype1: 0, defaultRoletype2: 1, defaultRoletype3: 1 }
      : role.factions[0] === FACTION.IMP
        ? { roletype: [true, false, true, false, true], defaultRoletype1: 2, defaultRoletype2: 2, defaultRoletype3: 2 }
        : { roletype: [true, false, false, true, false], defaultRoletype1: 3, defaultRoletype2: 3, defaultRoletype3: 3 };

  return {
    id: index,
    name: role.label,
    ...legacy,
    actionType: actionType.role,
  };
});

export const createRoleImageMap = (publicUrl) => ROLE_CATALOG.reduce((images, role) => ({
  ...images,
  [role.label]: `${publicUrl}/image/${role.image}`,
}), {
  "？": `${publicUrl}/image/Unknown.png`,
  "成功": `${publicUrl}/image/Success.png`,
  "失敗": `${publicUrl}/image/Failure.png`,
});
