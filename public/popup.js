(() => {
  const status = document.getElementById("status");
  const playersElement = document.getElementById("players");
  const roleImageFiles = {
    スニッチ: "Snitch.png",
    インベ: "Investigator.png",
    ポリス: "Police.png",
    トラッパ: "Trapper.png",
    トラッカ: "Tracker.png",
    ルック: "Lookout.png",
    プロボカ: "Provoker.png",
    医者: "Doctor.png",
    バカ: "Insane.png",
    魔術師: "Magician.png",
    ホーンタ: "Haunter.png",
    ブレイマ: "Blamer.png",
    クリーナ: "Cleaner.png",
    シリアル: "SerialKiller.png",
    ボマー: "Bomber.png",
    シーフ: "Thief.png",
    サバイバ: "Survivor.png",
  };
  const actionIconFiles = {
    成功: "Success.png",
    失敗: "Failure.png",
    罠: "Trapper.png",
    補導: "Police.png",
  };
  const roleBackgroundColors = ["#ddd", "#8f8", "#f88", "#88f", "#ff8", "#8ff"];
  let snapshot;
  let order = [];
  let draggingId;
  let hasResizedToContent = false;

  const visibleTokens = (cell) => (Array.isArray(cell) ? cell : [])
    .filter((item) => Array.isArray(item) && item[0] && item[2] !== 4);

  const isInsaneResultToken = (token) => token[0] === "バカ結果？";

  const hasInsaneResult = (cell) => (Array.isArray(cell) ? cell : [])
    .some((token) => Array.isArray(token) && isInsaneResultToken(token));

  const appendToken = (container, token, className = "cell-token") => {
    const item = document.createElement("span");
    item.className = className;
    const label = token[0];
    const playerImage = token[2] === 2 ? snapshot.colorNameDic?.[label]?.[0] : undefined;
    const actionIcon = actionIconFiles[label];
    const roleImage = roleImageFiles[label];

    if (playerImage) {
      const imageElement = document.createElement("img");
      imageElement.className = "player-icon";
      imageElement.src = playerImage;
      imageElement.alt = label;
      item.append(imageElement);
      item.title = label;
    } else if (actionIcon) {
      const imageElement = document.createElement("img");
      imageElement.src = `./image/${actionIcon}`;
      imageElement.alt = label;
      item.classList.add("action-icon-token");
      item.append(imageElement);
    } else if (roleImage) {
      const imageElement = document.createElement("img");
      imageElement.src = `./image/${roleImage}`;
      imageElement.alt = label;
      item.append(imageElement);
      if (roleBackgroundColors[token[1]]) {
        item.classList.add("role-colored-token");
        item.style.background = roleBackgroundColors[token[1]];
      }
    } else {
      item.textContent = label;
    }
    container.append(item);
  };

  const appendTokens = (container, tokens, className) => {
    tokens.forEach((token) => appendToken(container, token, className));
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

  const resizeWidthToContent = () => {
    if (typeof window.resizeTo !== "function") return;

    const bodyStyle = window.getComputedStyle(document.body);
    const horizontalMargins = parseFloat(bodyStyle.marginLeft) + parseFloat(bodyStyle.marginRight);
    const browserFrameWidth = Math.max(0, window.outerWidth - window.innerWidth);
    const width = Math.ceil(document.body.scrollWidth + horizontalMargins + browserFrameWidth);
    window.resizeTo(width, window.outerHeight);
  };

  const appendRole = (container, cell, className) => {
    const tokens = visibleTokens(cell).filter((token) => !isInsaneResultToken(token));
    if (!tokens.length) return false;
    appendTokens(container, tokens, className);
    return true;
  };

  const appendInsaneResultBadge = (container) => {
    const badge = document.createElement("img");
    badge.className = "insane-result-badge";
    badge.src = `./image/${roleImageFiles.バカ}`;
    badge.alt = "バカ結果？";
    badge.title = "バカ結果？";
    container.append(badge);
  };

  const revivedPlayersForDay = (day) => {
    const revivedPlayers = new Set();
    snapshot.tableData.forEach((row) => {
      const actionTokens = Array.isArray(row[`action_day${day}`]) ? row[`action_day${day}`] : [];
      actionTokens.forEach((token, index) => {
        if (!Array.isArray(token) || token[0] !== "蘇生") return;
        if (token[2] === 4) {
          const target = actionTokens.slice(0, index).reverse()
            .find((item) => Array.isArray(item) && item[2] === 2);
          if (target) revivedPlayers.add(target[0]);
        } else if (row.id >= 0 && row.name?.[0]) {
          revivedPlayers.add(row.name[0]);
        }
      });
    });
    return revivedPlayers;
  };

  const createDayRow = (player, day, revivedPlayers) => {
    const row = document.createElement("div");
    row.className = "day-row";

    const label = document.createElement("span");
    label.className = "day-label";
    const labelText = document.createElement("span");
    labelText.textContent = `${day}日:`;
    label.append(labelText);
    if (revivedPlayers.has(player.name?.[0])) {
      label.classList.add("has-revive");
      const reviveIndicator = document.createElement("span");
      reviveIndicator.className = "revive-indicator";

      const doctorIcon = document.createElement("img");
      doctorIcon.className = "day-doctor-icon";
      doctorIcon.src = "./image/Doctor.png";
      doctorIcon.alt = "医者";

      const reviveBadge = document.createElement("img");
      reviveBadge.className = "day-revive-badge";
      reviveBadge.src = "./image/Revive.png";
      reviveBadge.alt = "蘇生";
      reviveBadge.title = "蘇生";

      reviveIndicator.append(doctorIcon, reviveBadge);
      label.append(reviveIndicator);
    }
    row.append(label);

    const target = document.createElement("span");
    target.className = "day-cell target-cell";
    appendTokens(target, visibleTokens(player[`target_day${day}`]));
    row.append(target);

    const arrow = document.createElement("span");
    arrow.className = "day-arrow";
    arrow.textContent = "→";
    row.append(arrow);

    const action = document.createElement("span");
    action.className = "day-cell action-cell";
    const events = snapshot.playerEventsByDay?.[day]?.[player.name?.[0]]
      || (day === snapshot.day ? snapshot.playerEvents?.[player.name?.[0]] || [] : []);
    if (events.length) {
      action.textContent = events.join(" / ");
      action.classList.add("event-token");
    } else {
      const actionTokens = visibleTokens(player[`action_day${day}`])
        .filter((token) => token[0] !== "蘇生");
      appendTokens(action, actionTokens, "cell-token action-token");
    }
    row.append(action);
    return row;
  };

  const createPlayerWindow = (player, revivedPlayersByDay) => {
    const playerWindow = document.createElement("article");
    const color = snapshot.colorNameDic[player.name?.[0]]?.[1] || "#eeeeee";
    const dead = visibleTokens(player.deadRole).length > 0;
    playerWindow.className = `player-window${dead ? " is-dead" : ""}`;
    playerWindow.draggable = true;
    playerWindow.style.setProperty("--player-color", color);
    playerWindow.dataset.id = String(player.id);

    const name = document.createElement("div");
    name.className = "player-name";
    const playerName = player.name?.[0] || "名称未設定";
    const nameImage = snapshot.colorNameDic[playerName]?.[0];
    if (nameImage) {
      const image = document.createElement("img");
      image.className = "name-icon";
      image.src = nameImage;
      image.alt = "";
      name.append(image);
    }
    const nameLabel = document.createElement("span");
    nameLabel.className = "name-label";
    nameLabel.textContent = playerName;
    name.append(nameLabel);
    playerWindow.append(name);

    const roleArea = document.createElement("div");
    roleArea.className = "role-area";
    const hasDeadRole = visibleTokens(player.deadRole).length > 0;
    if (hasDeadRole) roleArea.classList.add("has-dead-role");
    appendRole(roleArea, player.role, "role-token claimed-role");

    appendRole(roleArea, player.deadRole, "role-token dead-role-token primary-role-token");
    if (hasInsaneResult(player.role)) appendInsaneResultBadge(roleArea);
    playerWindow.append(roleArea);

    const dayList = document.createElement("div");
    dayList.className = "day-list";
    for (let day = 1; day <= snapshot.day; day += 1) {
      dayList.append(createDayRow(player, day, revivedPlayersByDay.get(day)));
    }
    playerWindow.append(dayList);

    playerWindow.addEventListener("dragstart", () => {
      draggingId = player.id;
      playerWindow.classList.add("dragging");
    });
    playerWindow.addEventListener("dragend", () => playerWindow.classList.remove("dragging"));
    playerWindow.addEventListener("dragover", (event) => event.preventDefault());
    playerWindow.addEventListener("drop", (event) => {
      event.preventDefault();
      const targetId = player.id;
      if (draggingId === undefined || draggingId === targetId) return;
      order = order.filter((id) => id !== draggingId);
      order.splice(order.indexOf(targetId), 0, draggingId);
      render();
    });
    return playerWindow;
  };

  const render = () => {
    const players = orderedPlayers();
    const revivedPlayersByDay = new Map();
    for (let day = 1; day <= snapshot.day; day += 1) {
      revivedPlayersByDay.set(day, revivedPlayersForDay(day));
    }
    status.textContent = `${snapshot.day}日目の表示。プレイヤー枠はドラッグして並べ替えられます。`;
    playersElement.replaceChildren(...players.map((player) => createPlayerWindow(player, revivedPlayersByDay)));
    if (!hasResizedToContent) {
      resizeWidthToContent();
      hasResizedToContent = true;
    }
  };

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.source !== window.opener) return;
    if (event.data?.type !== "feign-board-snapshot") return;
    snapshot = event.data;
    render();
  });

  if (window.opener) {
    window.opener.postMessage({ type: "feign-popup-ready" }, window.location.origin);
  }
})();
