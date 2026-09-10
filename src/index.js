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
import { applyBoardActions as applyBoardActionSequence, createCellSaveActions } from "./boardActionSequence";
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


let FeignTool_popupWindow = null;

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
    const syncLegacyBoard = (nextState) => {
        legacyBoardRuntime.sync(nextState);
    };
    const applyBoardAction = (action) => {
        return applyBoardActions([action]);
    };
    const applyBoardActions = (actions) => {
        const nextState = applyBoardActionSequence({ ...boardState, board: data }, actions);
        dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
        syncLegacyBoard(nextState);
        return nextState;
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
                type: BOARD_ACTION.INITIALIZE_BOARD,
                playerNames: newNameStringList,
                eventRows: FeignTool.ActionsNameList,
            });
            dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
            syncLegacyBoard(nextState);
            setTableRevision((revision) => revision + 1);
            PopupWin(1, nextState);
        } else if (window.confirm("名前リストを更新しますか？（名前が削除・変更されたデータは消去されます）")) {
            const newNameStringList = parsePlayerNames(nameText);
            const nextState = boardReducer(
                { ...boardState, board: data, playerNames: nameStringList },
                { type: BOARD_ACTION.SET_PLAYER_NAMES, playerNames: newNameStringList },
            );
            setNameStringList(newNameStringList);
            dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
            syncLegacyBoard(nextState);
            setTableRevision((revision) => revision + 1);
            PopupWin(nextState.dayCount, nextState);
        }
    }
    const AddDay = () => {
        const nextState = applyBoardAction({ type: BOARD_ACTION.ADD_DAY });
        PopupWin(nextState.dayCount, nextState);
    }
    const AddRow = () => {
        const nextState = applyBoardAction({ type: BOARD_ACTION.ADD_MEMO_ROW });
        PopupWin(nextState.dayCount, nextState);
    }

    const playerIconChangeHandler = (event) => {
        applyBoardAction({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "playerIsIcon", value: event.target.checked });
    };
    const nameIconChangeHandler = (event) => {
        applyBoardAction({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "nameIsIcon", value: event.target.checked });
    };
    const onClickReset = () => {
        if (window.confirm("入力内容をリセットしますか？")) {
            const nextState = boardReducer({ ...boardState, board: data }, { type: BOARD_ACTION.RESET_BOARD, eventRows: FeignTool.ActionsNameList });
            dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
            syncLegacyBoard(nextState);
            PopupWin(1, nextState);
            return;
        }
        PopupWin(1);
    };
    const onOpenPopup = () => {
        FeignTool_popupWindow = window.open(
            process.env.PUBLIC_URL + '/popup.html',
            'FeignTool_popupWindow',
            'width=1000, height=300'
        );
        const sendWhenReady = () => {
            if (!FeignTool_popupWindow || FeignTool_popupWindow.closed) return;
            if (FeignTool_popupWindow.document.readyState !== "complete") {
                window.setTimeout(sendWhenReady, 100);
                return;
            }
            PopupWin(boardState.dayCount);
        };
        window.setTimeout(sendWhenReady, 100);
    };
    const MemeArea = () => {
        return (
            <div>
                <textarea style={{ width: "100vw", height: "20rem", border: "solid #ddd", outline: "none" }} placeholder="メモ" />
            </div>
        );
    }
    const PopupWin = (day, state = { ...boardState, board: data }) => {
        sendPopupSnapshot({ popupWindow: FeignTool_popupWindow, state, day, origin: window.location.origin });
    }
    const onCellSave = (oldValue, newValue, row, column) => {
        const nextState = applyBoardActions(createCellSaveActions({
            row, column, value: newValue, actionType: FeignTool.actionType,
            fixedDeathRoleForEvent: FeignTool.fixedDeathRoleForEvent,
        }));
        if (FeignTool_popupWindow) PopupWin(nextState.dayCount, nextState);
        if (column.dataField === 'name' || row.id < 0) setTableRevision((revision) => revision + 1);
    };

    return (
        <div>
            <div >
                <button onClick={AddDay}>翌日</button>
                <BoardTable
                    data={data}
                    columns={columns}
                    tableKey={`table-${PlayerIsIcon}-${NameIsIcon}-${tableRevision}`}
                    onCellSave={onCellSave}
                    roleLabelBgColor={FeignTool.roleLabelBgColor}
                    onAddMemo={AddRow}
                />
            </div>
            {MemeArea()}
            <NameInputPanel
                nameText={nameText}
                onNameTextChange={onChangeText}
                onOpenPopup={onOpenPopup}
                playerIsIcon={PlayerIsIcon}
                nameIsIcon={NameIsIcon}
                onPlayerIconChange={playerIconChangeHandler}
                onNameIconChange={nameIconChangeHandler}
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
