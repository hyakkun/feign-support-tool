import React, { useMemo, useReducer, useState } from 'react'
import ReactDOM from 'react-dom';
import {
    parsePlayerNames,
} from "./playerRows";
import {
    createBoardState,
    selectTableColumns,
    selectTableData,
} from "./boardState";
import { BOARD_ACTION, boardReducer } from "./boardReducer";
import { sendPopupSnapshot } from "./popupBridge";
import { BoardTable } from "./BoardTable";
import { NameInputPanel } from "./NameInputPanel";
import { TUTORIAL_PLAYER_NAMES, TUTORIAL_ROWS } from "./tutorialBoardData";
import { createBoardTableSetup } from "./boardTableSetup";
import { createCellSaveActions } from "./boardActionSequence";
import { initializeBoard, resetBoard, setPlayerNames } from "./boardCommands";
import { useBoardStateCommit } from "./useBoardStateCommit";
import { createPopupWindowController } from "./popupWindowController";
import { MemoArea } from "./MemoArea";
import { useBoardToolbarActions } from "./useBoardToolbarActions";
import './index.scss';



const initialBoardState = createBoardState({
    board: TUTORIAL_ROWS,
    playerNames: TUTORIAL_PLAYER_NAMES,
    isTutorial: true,
    dayCount: 2,
});
const { config: FeignTool, runtime: legacyBoardRuntime, tableDefinition } = createBoardTableSetup({
    publicUrl: process.env.PUBLIC_URL,
    initialState: initialBoardState,
});


const popupWindowController = createPopupWindowController({ windowObject: window, publicUrl: process.env.PUBLIC_URL });

const FeignSupportToolRoot = () => {
    const [boardState, dispatch] = useReducer(boardReducer, initialBoardState);
    const [tableRevision, setTableRevision] = useState(0);
    const [nameText, setNameText] = useState("");
    const PlayerIsIcon = boardState.display.playerIsIcon;
    const NameIsIcon = boardState.display.nameIsIcon;
    const { dayCount, isTutorial } = boardState;
    const [nameStringList, setNameStringList] = useState(TUTORIAL_PLAYER_NAMES);
    const data = selectTableData(boardState);
    const columns = useMemo(() => selectTableColumns({ dayCount, isTutorial }, tableDefinition), [dayCount, isTutorial]);
    const { commitState, applyActions } = useBoardStateCommit({
        boardState, data, dispatch, runtime: legacyBoardRuntime,
    });
    const applyBoardAction = (action) => {
        return applyActions([action]);
    };
    legacyBoardRuntime.setColorChangeHandler((playerName, color) => {
        applyBoardAction({ type: BOARD_ACTION.SET_PLAYER_COLOR, playerName, color });
        setTableRevision((revision) => revision + 1);
    });

    const onChangeText = (e) => {
        setNameText(e.target.value);
    }
    const onClickButton = () => {
        if (!boardState.playerNames.length || boardState.isTutorial || window.confirm("現在の内容を消去して、新しい名前リストを設定しますか？")) {
            const newNameStringList = parsePlayerNames(nameText);
            setNameStringList(newNameStringList);
            const nextState = boardReducer(boardState, {
                ...initializeBoard(newNameStringList, FeignTool.ActionsNameList),
            });
            commitState(nextState);
            setTableRevision((revision) => revision + 1);
            PopupWin(1, nextState);
        } else if (window.confirm("名前リストを更新しますか？（名前が削除・変更されたデータは消去されます）")) {
            const newNameStringList = parsePlayerNames(nameText);
            const nextState = boardReducer(
                { ...boardState, board: data, playerNames: nameStringList },
                setPlayerNames(newNameStringList),
            );
            setNameStringList(newNameStringList);
            commitState(nextState);
            setTableRevision((revision) => revision + 1);
            PopupWin(nextState.dayCount, nextState);
        }
    }
    const toolbarActions = useBoardToolbarActions({ applyAction: applyBoardAction, sendPopup: PopupWin });
    const onClickReset = () => {
        if (window.confirm("入力内容をリセットしますか？")) {
            const nextState = boardReducer({ ...boardState, board: data }, resetBoard(FeignTool.ActionsNameList));
            commitState(nextState);
            PopupWin(1, nextState);
            return;
        }
        PopupWin(1);
    };
    const onOpenPopup = () => {
        popupWindowController.open(() => PopupWin(boardState.dayCount));
    };
    function PopupWin(day, state = { ...boardState, board: data }) {
        sendPopupSnapshot({ popupWindow: popupWindowController.getWindow(), state, day, origin: window.location.origin });
    }
    const onCellSave = (oldValue, newValue, row, column) => {
        const nextState = applyActions(createCellSaveActions({
            row, column, value: newValue, actionType: FeignTool.actionType,
            fixedDeathRoleForEvent: FeignTool.fixedDeathRoleForEvent,
        }));
        if (popupWindowController.getWindow()) PopupWin(nextState.dayCount, nextState);
        if (column.dataField === 'name' || row.id < 0) setTableRevision((revision) => revision + 1);
    };

    return (
        <div>
            <div >
                <button onClick={toolbarActions.onAddDay}>翌日</button>
                <BoardTable
                    data={data}
                    columns={columns}
                    tableKey={`table-${PlayerIsIcon}-${NameIsIcon}-${tableRevision}`}
                    onCellSave={onCellSave}
                    roleLabelBgColor={FeignTool.roleLabelBgColor}
                    onAddMemo={toolbarActions.onAddMemo}
                />
            </div>
            <MemoArea />
            <NameInputPanel
                nameText={nameText}
                onNameTextChange={onChangeText}
                onOpenPopup={onOpenPopup}
                playerIsIcon={PlayerIsIcon}
                nameIsIcon={NameIsIcon}
                onPlayerIconChange={toolbarActions.onPlayerIconChange}
                onNameIconChange={toolbarActions.onNameIconChange}
                onSetNames={onClickButton}
                onReset={onClickReset}
            />
        </div>

    );

}


// ========================================

ReactDOM.render(
    <FeignSupportToolRoot />,
    document.getElementById('root')
);
