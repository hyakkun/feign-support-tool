import React from "react";

export const NameInputPanel = ({
  nameText,
  onNameTextChange,
  onOpenPopup,
  playerIsIcon,
  nameIsIcon,
  onPlayerIconChange,
  onNameIconChange,
  onSetNames,
  onReset,
}) => (
  <div>
    <div style={{ display: "flex" }}>
      <textarea cols="20" rows="12" value={nameText} onChange={onNameTextChange} style={{ display: "inline-block" }} placeholder="名前入力欄：参加者の名前（五文字以内）を改行区切りで入力" />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <a href="https://github.com/sawa90/feign-support-tool/blob/master/README.md" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "1rem" }}>使い方</a>
        <div style={{ marginTop: "auto" }}>
          <div>
            <div style={{ margin: "1rem" }}>
              <button onClick={onOpenPopup}>openDisplayWindow</button>
            </div>
            <label>
              <input type="checkbox" checked={playerIsIcon} onChange={onPlayerIconChange} id="iconCheckBox" style={{ marginLeft: "1rem" }} />
              アイコン
            </label>
            <label>
              <input type="checkbox" checked={nameIsIcon} onChange={onNameIconChange} id="nameIconCheckBox" style={{ marginLeft: "1rem" }} />
              名前欄アイコン
            </label>
          </div>
        </div>
      </div>
    </div>
    <div>
      <button onClick={onSetNames}>setName</button>
      <button onClick={onReset} style={{ marginLeft: "1rem" }}>リセット</button>
    </div>
  </div>
);
