import {
  LEGACY_SELECTOR,
  createLegacyRoleOptions,
  createRoleImageMap,
} from "./roleCatalog";
import { createLegacyEventRows } from "./eventRows";

export const ACTION_TYPE = Object.freeze({ action: 0, role: 1, name: 2, created: 3, option: 4 });

export const createBoardConfig = (publicUrl) => {
  const roleLabelBgColor = ["#fdd", "#ddf", "#dfd", "linear-gradient(#ffd 0%, #ffd 50%, #dfd 50%, #dfd 100%)", "#ffd"];
  const actionType = ACTION_TYPE;
  const colorList = [
    ["White", "#ffffff"], ["Orange", "#ff871f"], ["Purple", "#71348b"],
    ["Green", "#2a7b0c"], ["Blue", "#4b6fd7"], ["Red", "#b3000b"],
    ["Yellow", "#ffe352"], ["Lime", "#83ff46"], ["Cyan", "#31d7c7"],
    ["Pink", "#ff8fb3"], ["Brown", "#654321"], ["Magenta", "#ff00df"],
    ["DarkBlue", "#3817e3"], ["DarkGreen", "#2a5b2b"], ["DarkOrange", "#ff4406"],
  ].map(([name, hex]) => [`${publicUrl}/icon/${name}.png`, hex]);

  return {
    allRoleLabel: [
      { name: "赤確", roletypeNum: 0 }, { name: "青確", roletypeNum: 1 }, { name: "緑確", roletypeNum: 2 }, { name: "緑確バ", roletypeNum: 3 }, { name: "バカ", roletypeNum: 4 },
      { name: "緑赤バ", roletypeNum: 5 }, { name: "緑青バ", roletypeNum: 6 }, { name: "赤青バ", roletypeNum: 7 }, { name: "黒目バ", roletypeNum: 8 }, { name: "緑目バ", roletypeNum: 9 },
      { name: "赤目バ", roletypeNum: 10 }, { name: "青目バ", roletypeNum: 11 }, { name: "緑赤", roletypeNum: 12 }, { name: "緑青", roletypeNum: 13 }, { name: "赤青", roletypeNum: 14 },
      { name: "黒目", roletypeNum: 15 }, { name: "緑目", roletypeNum: 16 }, { name: "赤目", roletypeNum: 17 }, { name: "青目", roletypeNum: 18 }, { name: "不明", roletypeNum: 19 },
    ],
    roleLabel: [
      { name: "不明", roletypeNum: 19, index: 0 }, { name: "緑確", roletypeNum: 2, index: 1 }, { name: "赤確", roletypeNum: 0, index: 2 }, { name: "青確", roletypeNum: 1, index: 3 },
      { name: "バカ", roletypeNum: 4, index: 4 }, { name: "緑目", roletypeNum: 16, index: 5 }, { name: "赤目", roletypeNum: 17, index: 6 }, { name: "青目", roletypeNum: 18, index: 7 },
      { name: "緑赤", roletypeNum: 12, index: 8 }, { name: "緑青", roletypeNum: 13, index: 9 }, { name: "赤青", roletypeNum: 14, index: 10 }, { name: "黒目", roletypeNum: 15, index: 11 },
      { name: LEGACY_SELECTOR.FACTION, roletypeNum: -1, index: 12 },
    ],
    insaneRoleLabel: [
      { name: "不明", roletypeNum: 19 }, { name: "緑確バ", roletypeNum: 3 }, { name: "赤確", roletypeNum: 0 }, { name: "青確", roletypeNum: 1 }, { name: "バカ", roletypeNum: 4 },
      { name: "緑目バ", roletypeNum: 9 }, { name: "赤目バ", roletypeNum: 10 }, { name: "青目バ", roletypeNum: 11 }, { name: "緑赤バ", roletypeNum: 5 }, { name: "緑青バ", roletypeNum: 6 },
      { name: "赤青バ", roletypeNum: 7 }, { name: "黒目バ", roletypeNum: 8 }, { name: LEGACY_SELECTOR.FACTION, roletypeNum: -1 },
    ],
    roleLabelBgColor,
    optionbackground: roleLabelBgColor.map((background) => ({ background })).concat([
      { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #fdd 50%, #fdd 100%)" },
      { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #ddf 50%, #ddf 100%)" },
      { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, #ddf 50%, #ddf 100%)" },
      { background: "linear-gradient(45deg, #fdd 0%, #fdd 35%, #ddf 35%, #ddf 60%, #ffd 60%, #ffd 100%) " },
      { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #ffd 50%, #ffd 100%)" },
      { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, #ffd 50%, #ffd 100%)" },
      { background: "linear-gradient(45deg, #ddf 0%, #ddf 50%, #ffd 50%, #ffd 100%)" },
      { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #fdd 50%, #fdd 100%)" },
      { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, #ddf 50%, #ddf 100%)" },
      { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, #ddf 50%, #ddf 100%)" },
      { background: "linear-gradient(45deg, #fdd 0%, #fdd 35%, #ddf 35%, #ddf 60%, transparent 60%, transparent 100%) " },
      { background: "linear-gradient(45deg, #dfd 0%, #dfd 50%, transparent 50%, transparent 100%)" },
      { background: "linear-gradient(45deg, #fdd 0%, #fdd 50%, transparent 50%, transparent 100%)" },
      { background: "linear-gradient(45deg, #ddf 0%, #ddf 50%, transparent 50%, transparent 100%)" },
      { background: "transparent" },
    ]),
    roletype: ["role unknown", "role crew", "role imp", "role neutral", "role insane", "role sane"],
    roletypeColor: ["#ddd", "#8f8", "#f88", "#88f", "#ff8", "#8ff", "#888"],
    actionType,
    colorList,
    role: createLegacyRoleOptions(actionType).concat({ id: -1, name: "？", roletype: [true, true, true, true, true], actionType: actionType.role }),
    roleImage: createRoleImageMap(publicUrl),
    actionResult: [
      { id: 100, name: "成功", roletype: [true, false, false, false, false], actionType: actionType.action }, { id: 101, name: "失敗", roletype: [true, false, false, false, false], actionType: actionType.action },
      { id: 102, name: "？", roletype: [true, false, false, false, false], actionType: actionType.action }, { id: 103, name: "バカ結果？", roletype: [true, false, false, false, false], actionType: actionType.option },
      { id: 104, name: "真結果", roletype: [true, false, false, false, false], actionType: actionType.option }, { id: 105, name: "補導", roletype: [true, false, false, false, false], actionType: actionType.action },
      { id: 106, name: "罠", roletype: [true, false, false, false, false], actionType: actionType.action }, { id: 107, name: "在宅", roletype: [true, false, false, false, false], actionType: actionType.action },
      { id: 108, name: "来客", roletype: [true, true, true, true, false], actionType: actionType.action }, { id: 109, name: "蘇生", roletype: [true, false, false, false, false], actionType: actionType.action },
      { id: 110, name: "重要結果", roletype: [true, false, false, false, false], actionType: actionType.option },
    ],
    actionRevive: { id: 111, name: "蘇生", roletype: [true, false, false, false, false], actionType: actionType.option },
    reviveImage: `${publicUrl}/image/Revive.png`,
    hr: { id: -3, name: "hr", roletype: [false, false, false, false, false], actionType: actionType.option },
    br: { id: -4, name: "br", roletype: [false, false, false, false, false], actionType: actionType.option },
    ActionsNameList: createLegacyEventRows(actionType),
  };
};
