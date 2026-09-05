(() => {
  const status = document.getElementById("status");
  const playersElement = document.getElementById("players");
  let snapshot;
  let order = [];
  let draggingId;

  const cellText = (cell) => {
    if (!Array.isArray(cell)) return "";
    return cell
      .filter((item) => Array.isArray(item) && item[0] && (item[2] !== 4 || item[0] === "自爆"))
      .map((item) => item[0])
      .join(" / ");
  };

  const orderedPlayers = () => {
    const players = snapshot.tableData.filter((row) => row.id >= 0);
    const ids = new Set(players.map((player) => player.id));
    order = order.filter((id) => ids.has(id));
    players.forEach((player) => {
      if (!order.includes(player.id)) order.push(player.id);
    });
    return order.map((id) => players.find((player) => player.id === id));
  };

  const render = () => {
    const players = orderedPlayers();
    const day = snapshot.day;
    status.textContent = `${day}日目の表示。カードはドラッグして並べ替えられます。`;
    playersElement.replaceChildren();

    players.forEach((player) => {
      const card = document.createElement("article");
      const color = snapshot.colorNameDic[player.name?.[0]]?.[1] || "#eeeeee";
      card.className = "player";
      card.draggable = true;
      card.style.setProperty("--player-color", color);
      card.dataset.id = String(player.id);

      const title = document.createElement("h2");
      title.textContent = player.name?.[0] || "名称未設定";
      card.append(title);

      [
        ["役職", cellText(player.role)],
        ["死亡役職", cellText(player.deadRole)],
        ["対象", cellText(player[`target_day${day}`])],
        ["行動", cellText(player[`action_day${day}`])],
      ].forEach(([label, value]) => {
        if (!value) return;
        const row = document.createElement("p");
        const labelElement = document.createElement("span");
        labelElement.textContent = `${label}: `;
        row.append(labelElement, value);
        card.append(row);
      });

      card.addEventListener("dragstart", () => {
        draggingId = player.id;
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("dragover", (event) => event.preventDefault());
      card.addEventListener("drop", (event) => {
        event.preventDefault();
        const targetId = player.id;
        if (draggingId === undefined || draggingId === targetId) return;
        order = order.filter((id) => id !== draggingId);
        order.splice(order.indexOf(targetId), 0, draggingId);
        render();
      });
      playersElement.append(card);
    });
  };

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== "feign-board-snapshot") return;
    snapshot = event.data;
    render();
  });
})();
