import { useState } from "react";
import { boardReducer } from "../boardReducer";
import { parsePlayerNames } from "../../model/playerRows";
import { initializeBoard, resetBoard, setPlayerNames } from "../boardCommands";

export const useNameBoardActions = ({ boardState, data, playerNames, eventRows, commitState, sendPopup, setTableRevision, windowObject }) => {
  const [nameText, setNameText] = useState("");
  const [nameStringList, setNameStringList] = useState(playerNames);
  const onNameTextChange = (event) => setNameText(event.target.value);
  const onSetNames = () => {
    const nextNames = parsePlayerNames(nameText);
    if (!boardState.playerNames.length || boardState.isTutorial || windowObject.confirm("現在の内容を消去して、新しい名前リストを設定しますか？")) {
      const nextState = boardReducer(boardState, initializeBoard(nextNames, eventRows));
      setNameStringList(nextNames); commitState(nextState); setTableRevision((value) => value + 1); sendPopup(1, nextState);
    } else if (windowObject.confirm("名前リストを更新しますか？（名前が削除・変更されたデータは消去されます）")) {
      const nextState = boardReducer({ ...boardState, board: data, playerNames: nameStringList }, setPlayerNames(nextNames));
      setNameStringList(nextNames); commitState(nextState); setTableRevision((value) => value + 1); sendPopup(nextState.dayCount, nextState);
    }
  };
  const onReset = () => {
    if (windowObject.confirm("入力内容をリセットしますか？")) {
      const nextState = boardReducer({ ...boardState, board: data }, resetBoard(eventRows));
      commitState(nextState); sendPopup(1, nextState); return;
    }
    sendPopup(1);
  };
  return { nameText, onNameTextChange, onSetNames, onReset };
};
