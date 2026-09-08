import { ACTION_TYPE, createBoardConfig } from "./boardConfig";

describe("board configuration", () => {
  test("creates the legacy selector and fixed event options from one action type map", () => {
    const config = createBoardConfig("/tool");

    expect(config.actionType).toBe(ACTION_TYPE);
    expect(config.role.find((option) => option.name === "トラッカ")).toMatchObject({
      actionType: ACTION_TYPE.role,
    });
    expect(config.actionResult.find((option) => option.name === "蘇生")).toMatchObject({
      actionType: ACTION_TYPE.action,
    });
    expect(config.ActionsNameList.map((row) => row.name[0])).toEqual([
      "追放", "殺害", "爆発", "道連れ", "自爆", "医者", "対立", "ﾗｲﾝ",
    ]);
    expect(config.roleImage["スニッチ"]).toBe("/tool/image/Snitch.png");
    expect(config.colorList).toHaveLength(15);
    expect(config.colorList[0]).toEqual(["/tool/icon/White.png", "#ffffff"]);
    expect(config.colorList[14]).toEqual(["/tool/icon/DarkOrange.png", "#ff4406"]);
  });

  test("keeps background colors aligned with every role type number", () => {
    const backgrounds = createBoardConfig("/tool").optionbackground.map(({ background }) => background);

    expect(backgrounds).toHaveLength(20);
    expect(backgrounds[12]).toBe("linear-gradient(45deg, #dfd 0%, #dfd 50%, #fdd 50%, #fdd 100%)");
    expect(backgrounds[13]).toBe("linear-gradient(45deg, #dfd 0%, #dfd 50%, #ddf 50%, #ddf 100%)");
    expect(backgrounds[16]).toBe("linear-gradient(45deg, #dfd 0%, #dfd 50%, transparent 50%, transparent 100%)");
    expect(backgrounds[18]).toBe("linear-gradient(45deg, #ddf 0%, #ddf 50%, transparent 50%, transparent 100%)");
  });
});
