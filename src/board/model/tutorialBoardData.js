export const TUTORIAL_PLAYER_NAMES = Object.freeze([
  "名前例", "最初に", "名前は", "ページ下部", "入力欄に", "改行区切り",
  "で入力", "setName", "で設定", "詳細は", "入力欄横", "使い方参照",
]);

export const TUTORIAL_ROWS = [
  { keyid: 0, id: 0, name: ["名前例", 19], color: ["/feign-support-tool/icon/Yellow.png", "#ffe352"], role: [["スニッチ", 1, 1], ["真結果", 5, 4]], target_day2: [["最初に", 0, 2]], action_day2: [["ポリス", 1, 1], ["重要結果", 0, 4]] },
  { keyid: 1, id: 1, name: ["名前は", 4], color: ["/feign-support-tool/icon/Magenta.png", "#ff00df"], role: [["インベ", 0, 1]], deadRole: [], target_day1: [["ページ下部", 0, 2]], action_day1: [["スニッチ", 1, 1], ["クリーナ", 2, 1], ["バカ結果？", 4, 4]], target_day2: [], action_day2: [] },
  { keyid: 2, id: 2, name: ["最初に", 2], color: ["/feign-support-tool/icon/Blue.png", "#4b6fd7"], role: [], action_day2: [] },
  { keyid: 3, id: 3, name: ["ページ下部", 19], color: ["/feign-support-tool/icon/DarkBlue.png", "#3817e3"], role: [["トラッパ", 0, 1], ["真結果", 5, 4]], target_day1: [["入力欄横", 0, 2]], action_day1: [["成功", 0, 0], ["真結果", 5, 4]] },
  { keyid: 4, id: 4, name: ["入力欄に", 1], color: ["/feign-support-tool/icon/Red.png", "#b3000b"], role: [["トラッパ", 0, 1]], target_day1: [["入力欄横", 0, 2]], action_day1: [["失敗", 0, 0]], deadRole: [["ボマー", 3, 1]] },
  { keyid: 5, id: 5, name: ["改行区切り", 19], color: ["/feign-support-tool/icon/Pink.png", "#ff8fb3"] },
  { keyid: 6, id: 6, name: ["で入力", 19], color: ["/feign-support-tool/icon/Cyan.png", "#31d7c7"], action_day1: [["補導", 0, 0]] },
  { keyid: 7, id: 7, name: ["setName", 4], color: ["/feign-support-tool/icon/Purple.png", "#71348b"], role: [["ルック", 0, 1]], target_day1: [["改行区切り", 0, 2]], action_day1: [["使い方参照", 0, 2], ["バカ結果？", 4, 4]], target_day2: [["で設定", 0, 2]] },
  { keyid: 8, id: 8, name: ["で設定", 19], color: ["/feign-support-tool/icon/Green.png", "#2a7b0c"], role: [], action_day1: [["蘇生", 0, 0]] },
  { keyid: 9, id: 9, name: ["詳細は", 19], color: ["/feign-support-tool/icon/Brown.png", "#654321"], target_day1: [["入力欄横", 0, 2]], action_day1: [["罠", 0, 0]] },
  { keyid: 10, id: 10, name: ["入力欄横", 16], color: ["/feign-support-tool/icon/White.png", "#ffffff"], target_day1: [["で設定", 0, 2]], role: [["ルック", 0, 1]], action_day1: [["入力欄に", 0, 2], ["改行区切り", 0, 2]], target_day2: [["ページ下部", 0, 2]], action_day2: [["setName", 0, 2], ["バカ結果？", 4, 4]] },
  { keyid: 11, id: 11, name: ["使い方参照", 4], color: ["/feign-support-tool/icon/Orange.png", "#ff871f"], deadRole: [["バカ", 1, 1]] },
  { keyid: -1, id: -1, name: ["追放", 19], target_day1: [["入力欄に", 0, 2]] },
  { keyid: -2, id: -2, name: ["殺害", 19], target_day2: [["使い方参照", 0, 2]], target_day1: [["で設定", 0, 2], ["蘇生", 0, 4]], action_day1: [] },
  { keyid: -3, id: -3, name: ["爆発", 19], role: [["ボマー", 3, 1]] },
  { keyid: -4, id: -4, name: ["道連れ", 19] },
  { keyid: -5, id: -5, name: ["自爆", 19] },
  { keyid: -6, id: -6, name: ["医者", 19], role: [["医者", 1, 1]], target_day1: [["で設定", 0, 2], ["蘇生", 0, 4]] },
  { keyid: -7, id: -7, name: ["対立", 19] },
  { keyid: -8, id: -8, name: ["ﾗｲﾝ", 19] },
];
