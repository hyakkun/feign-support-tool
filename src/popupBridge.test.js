import { createBoardState } from "./board/state/boardState";
import { sendPopupSnapshot } from "./popupBridge";

test("sends a derived board snapshot to an open popup window", () => {
  const popupWindow = { closed: false, postMessage: jest.fn() };
  const state = createBoardState({
    board: [
      { id: 0, keyid: 0, name: ["アリス", 19], color: ["yellow", "#ffe352"] },
      { id: -5, keyid: -5, name: ["自爆", 19], target_day1: [["アリス", 0, 2]] },
    ],
    playerNames: ["アリス"],
  });

  expect(sendPopupSnapshot({ popupWindow, state, day: 1, origin: "https://example.test" })).toBe(true);
  expect(popupWindow.postMessage).toHaveBeenCalledWith(expect.objectContaining({
    tableData: state.board,
    colorNameDic: { "アリス": ["yellow", "#ffe352"] },
    playerEvents: { "アリス": ["自爆"] },
    day: 1,
  }), "https://example.test");
});

test("does not send when the popup is unavailable", () => {
  const state = createBoardState({ board: [], playerNames: [] });
  expect(sendPopupSnapshot({ popupWindow: null, state, day: 1, origin: "https://example.test" })).toBe(false);
  expect(sendPopupSnapshot({ popupWindow: { closed: true }, state, day: 1, origin: "https://example.test" })).toBe(false);
});
