import React, { useMemo, useReducer, useState } from 'react'
import ReactDOM from 'react-dom';
import {
    createBoardState,
    selectTableColumns,
    selectTableData,
} from "./boardState";
import { boardReducer } from "./boardReducer";
import { sendPopupSnapshot } from "./popupBridge";
import { BoardTable } from "./BoardTable";
import { NameInputPanel } from "./NameInputPanel";
import { TUTORIAL_PLAYER_NAMES, TUTORIAL_ROWS } from "./tutorialBoardData";
import { createBoardTableSetup } from "./boardTableSetup";
import { useBoardStateCommit } from "./useBoardStateCommit";
import { createPopupWindowController } from "./popupWindowController";
import { MemoArea } from "./MemoArea";
import { useBoardToolbarActions } from "./useBoardToolbarActions";
import { useNameBoardActions } from "./useNameBoardActions";
import { useBoardCellActions } from "./useBoardCellActions";
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
    const PlayerIsIcon = boardState.display.playerIsIcon;
    const NameIsIcon = boardState.display.nameIsIcon;
    const { dayCount, isTutorial } = boardState;
    const data = selectTableData(boardState);
    const columns = useMemo(() => selectTableColumns({ dayCount, isTutorial }, tableDefinition), [dayCount, isTutorial]);
    const { commitState, applyActions } = useBoardStateCommit({
        boardState, data, dispatch, runtime: legacyBoardRuntime,
    });
    const applyBoardAction = (action) => {
        return applyActions([action]);
    };

    const nameActions = useNameBoardActions({ boardState, data, playerNames: TUTORIAL_PLAYER_NAMES, eventRows: FeignTool.ActionsNameList, commitState, sendPopup: PopupWin, setTableRevision, windowObject: window });
    const toolbarActions = useBoardToolbarActions({ applyAction: applyBoardAction, sendPopup: PopupWin });
    const cellActions = useBoardCellActions({ applyAction: applyBoardAction, applyActions, config: FeignTool, hasPopup: () => Boolean(popupWindowController.getWindow()), sendPopup: PopupWin, setTableRevision });
    legacyBoardRuntime.setColorChangeHandler(cellActions.onColorChange);
    const onOpenPopup = () => {
        popupWindowController.open(() => PopupWin(boardState.dayCount));
    };
    function PopupWin(day, state = { ...boardState, board: data }) {
        sendPopupSnapshot({ popupWindow: popupWindowController.getWindow(), state, day, origin: window.location.origin });
    }

    return (
        <div>
            <div >
                <button onClick={toolbarActions.onAddDay}>翌日</button>
                <BoardTable
                    data={data}
                    columns={columns}
                    tableKey={`table-${PlayerIsIcon}-${NameIsIcon}-${tableRevision}`}
                    onCellSave={cellActions.onCellSave}
                    roleLabelBgColor={FeignTool.roleLabelBgColor}
                    onAddMemo={toolbarActions.onAddMemo}
                />
            </div>
            <MemoArea />
            <NameInputPanel
                nameText={nameActions.nameText}
                onNameTextChange={nameActions.onNameTextChange}
                onOpenPopup={onOpenPopup}
                playerIsIcon={PlayerIsIcon}
                nameIsIcon={NameIsIcon}
                onPlayerIconChange={toolbarActions.onPlayerIconChange}
                onNameIconChange={toolbarActions.onNameIconChange}
                onSetNames={nameActions.onSetNames}
                onReset={nameActions.onReset}
            />
        </div>

    );

}


// ========================================

ReactDOM.render(
    <FeignSupportToolRoot />,
    document.getElementById('root')
);
