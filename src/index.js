import React, { useMemo, useReducer, useState } from 'react'
import ReactDOM from 'react-dom';
import { createLegacyRoleToken } from "./roleCatalog";
import {
    deathRoleRecordsFromEventCell,
    fixedDeathRoleIdForEventLabel,
    isDeathEventLabel,
} from "./eventRows";
import {
    parsePlayerNames,
} from "./playerRows";
import { createBoardConfig } from "./boardConfig";
import { createBoardTableFormatters } from "./boardTableFormatters";
import { RoleSelect } from "./RoleSelect";
import {
    createBoardState,
    selectTableColumns,
    selectTableData,
} from "./boardState";
import { BOARD_ACTION, boardReducer } from "./boardReducer";
import { sendPopupSnapshot } from "./popupBridge";
import { BoardTable } from "./BoardTable";
import { NameInputPanel } from "./NameInputPanel";
import { createLegacyBoardRuntime } from "./legacyBoardRuntime";
import { TUTORIAL_PLAYER_NAMES, TUTORIAL_ROWS } from "./tutorialBoardData";
import {
    sortCellItems,
    sortDeadRoles,
    sortRoles,
} from "./boardColumnSorts";
import { createDayColumnDefinitions } from "./dayColumnDefinitions";
import { createIdentityColumnDefinitions } from "./identityColumnDefinitions";
import './index.scss';



const FeignTool = {};

Object.assign(FeignTool, createBoardConfig(process.env.PUBLIC_URL));
FeignTool.fixedDeathRoleForEvent = (eventLabel) => {
    const roleId = fixedDeathRoleIdForEventLabel(eventLabel);
    return roleId ? createLegacyRoleToken(roleId, FeignTool.actionType) : undefined;
};
const initialBoardState = createBoardState({
    board: TUTORIAL_ROWS,
    playerNames: TUTORIAL_PLAYER_NAMES,
    isTutorial: true,
    dayCount: 2,
});
const legacyBoardRuntime = createLegacyBoardRuntime({
    initialState: initialBoardState,
    actionType: FeignTool.actionType,
});
FeignTool.getColorNameDictionary = () => legacyBoardRuntime.getColorNameDictionary();
FeignTool.getTableData = () => legacyBoardRuntime.getTableData();
FeignTool.getPlayerOptions = () => legacyBoardRuntime.getPlayerOptions();
FeignTool.column_template = {
    sort: true,
    sortFunc: sortCellItems,
    editable: true,
};

const tableFormatters = createBoardTableFormatters({
    ...FeignTool,
    getColorNameDictionary: () => legacyBoardRuntime.getColorNameDictionary(),
    getPlayerIsIcon: () => legacyBoardRuntime.getPlayerIsIcon(),
});
FeignTool.formatter_templete = tableFormatters.cellFormatter;
FeignTool.dead_formatter = tableFormatters.deathFormatter;
FeignTool.deadFormatter = tableFormatters.deathFormatter;
const dayColumnDefinitions = createDayColumnDefinitions({
    config: FeignTool,
    runtime: legacyBoardRuntime,
    columnTemplate: FeignTool.column_template,
});
FeignTool.target_day = dayColumnDefinitions.targetDay;
FeignTool.action_day = dayColumnDefinitions.actionDay;
const identityColumns = createIdentityColumnDefinitions({
    config: FeignTool,
    runtime: legacyBoardRuntime,
});
FeignTool.defaultColumns = [
    ...identityColumns,
    {
        text: '役',
        dataField: 'role',
        ...FeignTool.column_template,
        formatter: FeignTool.formatter_templete('role'),
        sortFunc: sortRoles,
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            if (!(column.dataField in row)) row[column.dataField] = [];
            const roleWithTrue = [...FeignTool.role, FeignTool.br, { id: 103, name: "バ", roletype: [true, false, false, false, false], actionType: 4 }, { id: 104, name: "真", roletype: [true, false, false, false, false], actionType: 4 }];
            return (
                <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={roleWithTrue} dataField={column.dataField} text={column.text} />
            );
        },
    },
    {
        text: '死',
        dataField: 'deadRole',
        formatter: FeignTool.formatter_templete('deadRole'),
        ...FeignTool.column_template,
        sortFunc: sortDeadRoles,
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            if (!(column.dataField in row)) row[column.dataField] = [];
            return (
                <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={FeignTool.role} dataField={column.dataField} text={column.text} />
            );
        },
    },
    { ...FeignTool.target_day, formatter: FeignTool.dead_formatter('target_day1'), text: '1', dataField: 'target_day1', },
    { ...FeignTool.action_day, formatter: FeignTool.dead_formatter('action_day1'), dataField: 'action_day1', },
];
FeignTool.tutorialBaseColumns = FeignTool.defaultColumns.slice(0, -2);
FeignTool.playerBaseColumns = FeignTool.tutorialBaseColumns.map((column, index) => (
    index === 1 ? { ...column, text: "名前" } : column
));
FeignTool.tableDefinition = {
    tutorialBaseColumns: FeignTool.tutorialBaseColumns,
    playerBaseColumns: FeignTool.playerBaseColumns,
    targetDay: FeignTool.target_day,
    actionDay: FeignTool.action_day,
    deadFormatter: FeignTool.deadFormatter,
};


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
    const columns = useMemo(() => selectTableColumns({ dayCount, isTutorial }, FeignTool.tableDefinition), [dayCount, isTutorial]);
    const syncLegacyBoard = (nextState) => {
        legacyBoardRuntime.sync(nextState);
    };
    const applyBoardAction = (action) => {
        return applyBoardActions([action]);
    };
    const applyBoardActions = (actions) => {
        const nextState = actions.reduce(
            (state, action) => boardReducer(state, action),
            { ...boardState, board: data },
        );
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
        const deathRoleActions = isDeathEventLabel(row.name[0])
            ? deathRoleRecordsFromEventCell(row.name[0], newValue, FeignTool.actionType).map((record) => ({
                type: BOARD_ACTION.RECORD_DEATH_ROLE,
                playerName: record.playerName,
                roleToken: record.roleToken || FeignTool.fixedDeathRoleForEvent(row.name[0]),
                preventDuplicate: Boolean(record.fixedDeathRoleId),
            }))
            : [];
        const nextState = applyBoardActions([
            { type: BOARD_ACTION.UPDATE_CELL, rowId: row.id, field: column.dataField, value: newValue },
            ...deathRoleActions,
        ]);
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
