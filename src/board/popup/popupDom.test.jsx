import fs from "fs";
import path from "path";

const loadPopup = () => {
  document.body.innerHTML = '<p id="status"></p><section id="players"></section>';
  const scriptPath = path.resolve(process.cwd(), "public/popup.js");
  window.eval(fs.readFileSync(scriptPath, "utf8"));
};

const sendSnapshot = (snapshot) => {
  window.dispatchEvent(new MessageEvent("message", {
    origin: window.location.origin,
    data: { type: "feign-board-snapshot", ...snapshot },
  }));
};

test("renders a popup player card using the color from the received snapshot", () => {
  loadPopup();

  sendSnapshot({
    day: 1,
    colorNameDic: { アリス: ["/icon/test.png", "#123456"] },
    playerEvents: { アリス: ["自爆"] },
    tableData: [{
      id: 0,
      keyid: 0,
      name: ["アリス", 19],
      role: [["魔術師", 3, 1]],
      target_day1: [["ボブ", 0, 2]],
    }],
  });

  const card = document.querySelector("article.player");
  expect(card).toHaveStyle("--player-color: #123456");
  expect(card).toHaveTextContent("アリス");
  expect(card).toHaveTextContent("役職: 魔術師");
  expect(card).toHaveTextContent("対象: ボブ");
  expect(card).toHaveTextContent("イベント: 自爆");
});

test("ignores snapshots from a different origin", () => {
  loadPopup();

  window.dispatchEvent(new MessageEvent("message", {
    origin: "https://untrusted.example",
    data: { type: "feign-board-snapshot", day: 1, tableData: [] },
  }));

  expect(document.querySelector("article.player")).not.toBeInTheDocument();
});
