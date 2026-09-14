import fs from "fs";
import path from "path";

const loadPopup = () => {
  document.body.innerHTML = '<p id="status"></p><section id="players"></section>';
  window.resizeTo = vi.fn();
  const scriptPath = path.resolve(process.cwd(), "public/popup.js");
  window.eval(fs.readFileSync(scriptPath, "utf8"));
};

const sendSnapshot = (snapshot) => {
  window.dispatchEvent(new MessageEvent("message", {
    origin: window.location.origin,
    data: { type: "feign-board-snapshot", ...snapshot },
  }));
};

test("renders a compact player window and places a death event in the current day action", () => {
  loadPopup();

  sendSnapshot({
    day: 1,
    colorNameDic: {
      アリス: ["/icon/test.png", "#123456"],
      ボブ: ["/icon/bob.png", "#654321"],
    },
    playerEvents: { アリス: ["自爆"] },
    tableData: [{
      id: 0,
      keyid: 0,
      name: ["アリス", 19],
      role: [["魔術師", 3, 1]],
      target_day1: [["ボブ", 0, 2]],
    }],
  });

  const card = document.querySelector("article.player-window");
  expect(card).toHaveStyle("--player-color: #123456");
  expect(card).toHaveTextContent("アリス");
  expect(card.querySelector(".name-icon")).toHaveAttribute("src", "/icon/test.png");
  expect(card).toHaveTextContent("魔術師");
  expect(card).toHaveTextContent("1日:");
  expect(card.querySelector(".day-cell .player-icon")).toHaveAttribute("src", "/icon/bob.png");
  expect(card).toHaveTextContent("自爆");
  expect(card).not.toHaveTextContent("イベント:");
  expect(window.resizeTo).toHaveBeenCalledTimes(1);
});

test("ignores snapshots from a different origin", () => {
  loadPopup();

  window.dispatchEvent(new MessageEvent("message", {
    origin: "https://untrusted.example",
    data: { type: "feign-board-snapshot", day: 1, tableData: [] },
  }));

  expect(document.querySelector("article.player")).not.toBeInTheDocument();
});

test("places an earlier day death event in that day's action cell", () => {
  loadPopup();

  sendSnapshot({
    day: 2,
    colorNameDic: { アリス: ["/icon/test.png", "#123456"] },
    playerEventsByDay: { 1: { アリス: ["道連れ"] }, 2: {} },
    tableData: [{
      id: 0,
      keyid: 0,
      name: ["アリス", 19],
      action_day2: [["罠", 0, 0]],
    }],
  });

  const dayRows = document.querySelectorAll("article.player-window .day-row");
  expect(dayRows[0]).toHaveTextContent("道連れ");
  expect(dayRows[1]).toHaveTextContent("罠");
});

test("uses role colors for role icon frames and keeps uncolored players as text", () => {
  loadPopup();

  sendSnapshot({
    day: 1,
    colorNameDic: { アリス: ["/icon/test.png", "#123456"] },
    tableData: [{
      id: 0,
      keyid: 0,
      name: ["アリス", 19],
      role: [["医者", 1, 1]],
      target_day1: [["色なし", 0, 2]],
      action_day1: [["医者", 1, 1]],
    }],
  });

  const card = document.querySelector("article.player-window");
  expect(card.querySelector(".role-token")).toHaveStyle("background: #8f8");
  expect(card.querySelector(".day-cell")).toHaveTextContent("色なし");
  expect(card.querySelectorAll(".day-cell img")[0]).toHaveAttribute("alt", "医者");
});

test("makes a death role prominent and joins multiple action results without separators", () => {
  loadPopup();

  sendSnapshot({
    day: 1,
    colorNameDic: {},
    tableData: [{
      id: 0,
      keyid: 0,
      name: ["アリス", 19],
      role: [["医者", 1, 1]],
      deadRole: [["ボマー", 3, 1]],
      action_day1: [["成功", 0, 0], ["失敗", 0, 0]],
    }],
  });

  const card = document.querySelector("article.player-window");
  expect(card.querySelector(".role-area")).toHaveClass("has-dead-role");
  expect(card.querySelector(".claimed-role")).toBeInTheDocument();
  expect(card.querySelector(".prominent-dead-role")).toBeInTheDocument();
  const actionCell = card.querySelectorAll(".day-cell")[1];
  expect(actionCell).toHaveTextContent("成功失敗");
  expect(actionCell).not.toHaveTextContent("/");
});

test("shows a small insane-result badge instead of rendering its role metadata", () => {
  loadPopup();

  sendSnapshot({
    day: 1,
    colorNameDic: {},
    tableData: [{
      id: 0,
      keyid: 0,
      name: ["アリス", 19],
      role: [["医者", 1, 1], ["バカ結果？", 4, 4]],
    }],
  });

  const card = document.querySelector("article.player-window");
  expect(card.querySelector(".claimed-role img")).toHaveAttribute("alt", "医者");
  expect(card.querySelector(".insane-result-badge")).toHaveAttribute("src", "./image/Insane.png");
  expect(card.querySelector(".insane-result-badge")).toHaveAttribute("alt", "バカ結果？");
  expect(card.querySelector(".role-area")).not.toHaveTextContent("バカ結果？");
});
