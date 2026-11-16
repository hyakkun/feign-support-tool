import fs from "fs";
import path from "path";

const loadPopup = () => {
  document.body.innerHTML = '<p id="status"></p><section id="players"></section>';
  window.resizeTo = vi.fn();
  if (!window.opener) Object.defineProperty(window, "opener", { configurable: true, value: window });
  const scriptPath = path.resolve(process.cwd(), "public/popup.js");
  window.eval(fs.readFileSync(scriptPath, "utf8"));
};

const sendSnapshot = (snapshot) => {
  window.dispatchEvent(new MessageEvent("message", {
    origin: window.location.origin,
    source: window.opener,
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
  expect(card.querySelector(".claimed-role img")).toHaveAttribute("alt", "魔術師");
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
  expect(dayRows[1].querySelector(".action-icon-token img"))
    .toHaveAttribute("alt", "罠");
  expect(dayRows[1].querySelector(".action-icon-token img"))
    .toHaveAttribute("src", "./image/Trapper.png");
});

test("shows the doctor icon and revive badge beside revived players' day labels", () => {
  loadPopup();

  sendSnapshot({
    day: 1,
    colorNameDic: {},
    tableData: [
      {
        id: 0,
        keyid: 0,
        name: ["アリス", 19],
        action_day1: [["蘇生", 0, 0]],
      },
      {
        id: 1,
        keyid: 1,
        name: ["ボブ", 19],
      },
      {
        id: -6,
        keyid: -6,
        name: ["医者", 19],
        action_day1: [["ボブ", 0, 2], ["蘇生", 0, 4]],
      },
    ],
  });

  const alice = document.querySelector('article.player-window[data-id="0"]');
  const aliceDayLabel = alice.querySelector(".day-label");
  expect(aliceDayLabel.querySelector(".day-doctor-icon"))
    .toHaveAttribute("src", "./image/Doctor.png");
  expect(aliceDayLabel.querySelector(".day-revive-badge"))
    .toHaveAttribute("src", "./image/Revive.png");
  expect(alice.querySelectorAll(".day-cell")[1]).not.toHaveTextContent("蘇生");

  const bob = document.querySelector('article.player-window[data-id="1"]');
  expect(bob.querySelector(".day-label .day-revive-badge"))
    .toHaveAttribute("alt", "蘇生");
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

test("notifies the opener after registering the snapshot listener", () => {
  const originalOpener = Object.getOwnPropertyDescriptor(window, "opener");
  const opener = {
    postMessage: vi.fn((message, targetOrigin) => {
      window.dispatchEvent(new MessageEvent("message", {
        origin: targetOrigin,
        source: opener,
        data: {
          type: "feign-board-snapshot",
          day: 1,
          colorNameDic: {},
          tableData: [{ id: 0, keyid: 0, name: ["アリス", 19] }],
        },
      }));
    }),
  };
  Object.defineProperty(window, "opener", { configurable: true, value: opener });

  try {
    loadPopup();

    expect(opener.postMessage).toHaveBeenCalledWith(
      { type: "feign-popup-ready" },
      window.location.origin,
    );
    expect(document.querySelector("article.player-window")).toHaveTextContent("アリス");
  } finally {
    if (originalOpener) Object.defineProperty(window, "opener", originalOpener);
    else delete window.opener;
  }
});

test("uses the local preview images for the added roles", () => {
  loadPopup();

  sendSnapshot({
    day: 1,
    colorNameDic: {},
    tableData: [{
      id: 0,
      keyid: 0,
      name: ["アリス", 19],
      role: [["トラッカ", 1, 1], ["魔術師", 3, 1], ["ホーンタ", 3, 1]],
    }],
  });

  expect(Array.from(document.querySelectorAll(".claimed-role img"))
    .map((image) => image.getAttribute("alt")))
    .toEqual(["トラッカ", "魔術師", "ホーンタ"]);
  expect(Array.from(document.querySelectorAll(".claimed-role img"))
    .map((image) => image.getAttribute("src")))
    .toEqual(["./image/Tracker.png", "./image/Magician.png", "./image/Haunter.png"]);
});

test("makes a death role prominent and renders action icons without separators", () => {
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
      action_day1: [["成功", 0, 0], ["失敗", 0, 0], ["罠", 0, 0], ["補導", 0, 0]],
    }],
  });

  const card = document.querySelector("article.player-window");
  expect(card.querySelector(".role-area")).toHaveClass("has-dead-role");
  expect(card.querySelector(".claimed-role")).toBeInTheDocument();
  expect(card.querySelector(".dead-role-token")).toHaveClass("role-token", "primary-role-token");
  expect(card.querySelector(".role-area > .dead-role-token")).toBeInTheDocument();
  const actionCell = card.querySelectorAll(".day-cell")[1];
  expect(Array.from(actionCell.querySelectorAll(".action-icon-token img"))
    .map((image) => [image.getAttribute("alt"), image.getAttribute("src")]))
    .toEqual([
      ["成功", "./image/Success.png"],
      ["失敗", "./image/Failure.png"],
      ["罠", "./image/Trapper.png"],
      ["補導", "./image/Police.png"],
    ]);
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
