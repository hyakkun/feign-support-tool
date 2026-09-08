import React, { useMemo, useReducer, useState } from 'react'
import ReactDOM from 'react-dom';
import {
    ACTION_ITEM,
    createLegacyRoleToken,
} from "./roleCatalog";
import {
    deathRoleRecordsFromEventCell,
    allowsReviveForEventLabel,
    fixedDeathRoleIdForEventLabel,
    isDeathEventLabel,
} from "./eventRows";
import {
    createLegacyPlayerOptions,
    parsePlayerNames,
} from "./playerRows";
import { createBoardConfig } from "./boardConfig";
import { actionOptionsForRoleLabels, roleLabelsForRow } from "./actionOptions";
import { createBoardTableFormatters } from "./boardTableFormatters";
import { ColorSelect } from "./ColorSelect";
import { InsaneSelect } from "./InsaneSelect";
import { RoleSelect } from "./RoleSelect";
import { DeadSelect } from "./DeadSelect";
import {
    createBoardState,
    selectColorByPlayerName,
    selectPlayerOptions,
    selectTableColumns,
    selectTableData,
} from "./boardState";
import { BOARD_ACTION, boardReducer } from "./boardReducer";
import { sendPopupSnapshot } from "./popupBridge";
import { BoardTable } from "./BoardTable";
import { NameInputPanel } from "./NameInputPanel";
import './index.scss';



const FeignTool = {};
FeignTool.tutorialData = [{ "keyid": 0, "id": 0, "name": ["名前例", 19], "color": ["/feign-support-tool/icon/Yellow.png", "#ffe352"], "role": [["スニッチ", 1, 1], ["真結果", 5, 4]], "target_day2": [["最初に", 0, 2]], "action_day2": [["ポリス", 1, 1], ["重要結果", 0, 4]] }, { "keyid": 1, "id": 1, "name": ["名前は", 4], "color": ["/feign-support-tool/icon/Magenta.png", "#ff00df"], "role": [["インベ", 0, 1]], "deadRole": [], "target_day1": [["ページ下部", 0, 2]], "action_day1": [["スニッチ", 1, 1], ["クリーナ", 2, 1], ["バカ結果？", 4, 4]], "target_day2": [], "action_day2": [] }, { "keyid": 2, "id": 2, "name": ["最初に", 2], "color": ["/feign-support-tool/icon/Blue.png", "#4b6fd7"], "role": [], "action_day2": [] }, { "keyid": 3, "id": 3, "name": ["ページ下部", 19], "color": ["/feign-support-tool/icon/DarkBlue.png", "#3817e3"], "role": [["トラッパ", 0, 1], ["真結果", 5, 4]], "target_day1": [["入力欄横", 0, 2]], "action_day1": [["成功", 0, 0], ["真結果", 5, 4]] }, { "keyid": 4, "id": 4, "name": ["入力欄に", 1], "color": ["/feign-support-tool/icon/Red.png", "#b3000b"], "role": [["トラッパ", 0, 1]], "target_day1": [["入力欄横", 0, 2]], "action_day1": [["失敗", 0, 0]], "deadRole": [["ボマー", 3, 1]] }, { "keyid": 5, "id": 5, "name": ["改行区切り", 19], "color": ["/feign-support-tool/icon/Pink.png", "#ff8fb3"] }, { "keyid": 6, "id": 6, "name": ["で入力", 19], "color": ["/feign-support-tool/icon/Cyan.png", "#31d7c7"], "action_day1": [["補導", 0, 0]] }, { "keyid": 7, "id": 7, "name": ["setName", 4], "color": ["/feign-support-tool/icon/Purple.png", "#71348b"], "role": [["ルック", 0, 1]], "target_day1": [["改行区切り", 0, 2]], "action_day1": [["使い方参照", 0, 2], ["バカ結果？", 4, 4]], "target_day2": [["で設定", 0, 2]] }, { "keyid": 8, "id": 8, "name": ["で設定", 19], "color": ["/feign-support-tool/icon/Green.png", "#2a7b0c"], "role": [], "action_day1": [["蘇生", 0, 0]] }, { "keyid": 9, "id": 9, "name": ["詳細は", 19], "color": ["/feign-support-tool/icon/Brown.png", "#654321"], "target_day1": [["入力欄横", 0, 2]], "action_day1": [["罠", 0, 0]] }, { "keyid": 10, "id": 10, "name": ["入力欄横", 16], "color": ["/feign-support-tool/icon/White.png", "#ffffff"], "target_day1": [["で設定", 0, 2]], "role": [["ルック", 0, 1]], "action_day1": [["入力欄に", 0, 2], ["改行区切り", 0, 2]], "target_day2": [["ページ下部", 0, 2]], "action_day2": [["setName", 0, 2], ["バカ結果？", 4, 4]] }, { "keyid": 11, "id": 11, "name": ["使い方参照", 4], "color": ["/feign-support-tool/icon/Orange.png", "#ff871f"], "deadRole": [["バカ", 1, 1]] }, { "keyid": -1, "id": -1, "name": ["追放", 19], "target_day1": [["入力欄に", 0, 2]] }, { "keyid": -2, "id": -2, "name": ["殺害", 19], "target_day2": [["使い方参照", 0, 2]], "target_day1": [["で設定", 0, 2], ["蘇生", 0, 4]], "action_day1": [] }, { "keyid": -3, "id": -3, "name": ["爆発", 19], role: [["ボマー", 3, 1]] }, { "keyid": -4, "id": -4, "name": ["医者", 19], role: [["医者", 1, 1]], "target_day1": [["で設定", 0, 2], ["蘇生", 0, 4]] }, { "keyid": -5, "id": -5, "name": ["対立", 19] }, { "keyid": -6, "id": -6, "name": ["ﾗｲﾝ", 19] }];
FeignTool.tutorialNameStringList = ["名前例", "最初に", "名前は", "ページ下部", "入力欄に", "改行区切り", "で入力", "setName", "で設定", "詳細は", "入力欄横", "使い方参照",];

Object.assign(FeignTool, createBoardConfig(process.env.PUBLIC_URL));
FeignTool.fixedDeathRoleForEvent = (eventLabel) => {
    const roleId = fixedDeathRoleIdForEventLabel(eventLabel);
    return roleId ? createLegacyRoleToken(roleId, FeignTool.actionType) : undefined;
};
const tutorialEventsByLabel = new Map(FeignTool.tutorialData
    .filter((row) => row.id < 0)
    .map((row) => [row.name[0], row]));
FeignTool.tutorialData = FeignTool.tutorialData
    .filter((row) => row.id >= 0)
    .concat(FeignTool.ActionsNameList.map((eventRow) => ({
        ...(tutorialEventsByLabel.get(eventRow.name[0]) || eventRow),
        keyid: eventRow.keyid,
        id: eventRow.id,
    })));
FeignTool.column_template = {
    sort: true,
    sortFunc: (a, b, order, dataField, rowA, rowB) => {
        if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
        const valueIsResultColor = (array) => (
            array && array.length && array[0][2] === 4);
        const newvalue = (value, row) => {
            let nvalue = value.slice();
            while (valueIsResultColor(nvalue)) nvalue.shift();
            return nvalue;
        }
        const newa = newvalue(a, rowA);
        const newb = newvalue(b, rowB);
        const res = newa > newb ? 1 : (newa < newb ? -1 : 0);
        if (order === 'asc') return res;
        else return -res;
    },
    editable: true,
};

const tableFormatters = createBoardTableFormatters({
    ...FeignTool,
    getColorNameDictionary: () => FeignTool_colorNameDic,
    getPlayerIsIcon: () => FeignTool_playerIsIcon,
});
FeignTool.formatter_templete = tableFormatters.cellFormatter;
FeignTool.dead_formatter = tableFormatters.deathFormatter;
FeignTool.deadFormatter = tableFormatters.deathFormatter;
FeignTool.target_day = {
    ...FeignTool.column_template,
    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
        if (!(column.dataField in row)) row[column.dataField] = [];
        let options = FeignTool_nameList;
        if (row.id < 0) {
            if (isDeathEventLabel(row.name[0]))
                return (
                    <DeadSelect config={FeignTool} {...editorProps} value={value} row={row} options={FeignTool_nameList.concat(FeignTool.actionRevive)} fixedDeathRole={FeignTool.fixedDeathRoleForEvent(row.name[0])} dataField={column.dataField} text={column.text} />
                );
            if (allowsReviveForEventLabel(row.name[0])) options = options.concat(FeignTool.actionRevive);
        }
        return (
            <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={options} dataField={column.dataField} text={column.text} />
        );
    },
};
FeignTool.action_day = {
    text: '　',
    ...FeignTool.column_template,
    editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
        if (!(column.dataField in row)) row[column.dataField] = [];
        let allrole = [];
        if (row.id < 0 && isDeathEventLabel(row.name[0]))
            return (
                <DeadSelect config={FeignTool} {...editorProps} value={value} row={row} options={FeignTool_nameList.concat(FeignTool.actionRevive)} fixedDeathRole={FeignTool.fixedDeathRoleForEvent(row.name[0])} dataField={column.dataField} text={column.text} />
            );
        if (row.id < 0 && allowsReviveForEventLabel(row.name[0])) {
            const newOptions = FeignTool_nameList.concat(FeignTool.actionRevive);
            return (
                <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={newOptions} dataField={column.dataField} text={column.text} allRole={allrole} />
            );
        }
        allrole = roleLabelsForRow(row);
        const optionsByActionItem = {
            [ACTION_ITEM.ROLE]: FeignTool.role,
            [ACTION_ITEM.PLAYER]: FeignTool_nameList,
            [ACTION_ITEM.RESULT]: FeignTool.actionResult,
        };
        const newOptions = actionOptionsForRoleLabels(allrole, optionsByActionItem, FeignTool.hr);
        return (
            <RoleSelect config={FeignTool} {...editorProps} value={value} row={row} options={newOptions} dataField={column.dataField} text={column.text} allRole={allrole} />
        );
    },
};
FeignTool.colorList = [
    [process.env.PUBLIC_URL + "/icon/White.png", "#ffffff"],
    [process.env.PUBLIC_URL + "/icon/Orange.png", "#ff871f"],
    [process.env.PUBLIC_URL + "/icon/Purple.png", "#71348b"],
    [process.env.PUBLIC_URL + "/icon/Green.png", "#2a7b0c"],
    [process.env.PUBLIC_URL + "/icon/Blue.png", "#4b6fd7"],
    [process.env.PUBLIC_URL + "/icon/Red.png", "#b3000b"],
    [process.env.PUBLIC_URL + "/icon/Yellow.png", "#ffe352"],
    [process.env.PUBLIC_URL + "/icon/Lime.png", "#83ff46"],
    [process.env.PUBLIC_URL + "/icon/Cyan.png", "#31d7c7"],
    [process.env.PUBLIC_URL + "/icon/Pink.png", "#ff8fb3"],
    [process.env.PUBLIC_URL + "/icon/Brown.png", "#654321"],
    [process.env.PUBLIC_URL + "/icon/Magenta.png", "#ff00df"],
    [process.env.PUBLIC_URL + "/icon/DarkBlue.png", "#3817e3"],
    [process.env.PUBLIC_URL + "/icon/DarkGreen.png", "#2a5b2b"],
    [process.env.PUBLIC_URL + "/icon/DarkOrange.png", "#ff4406"],
];
FeignTool.defaultColumns = [
    {
        text: '　',
        dataField: 'color',
        editable: true,
        sort: true,
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            const res = a > b ? 1 : (a < b ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
        formatter: (cell, row) => {
            if (cell && cell.length > 1) {
                if (FeignTool_nameIsIcon && row.id >= 0) {
                    return <div className="tableCell" id={"color_tableid_" + row.id}><div className="colorIconContainer"><img src={cell[0]} alt={`${row.name[0]}の色`} /></div></div>;
                }
                return <div className="tableCell" id={"color_tableid_" + row.id}><div className="colorpicker" style={{ display: "block", backgroundColor: cell[1] }}>　</div></div>;
            }
                    return <div className="tableCell" id={"color_tableid_" + row.id}>　</div>;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            if (!(column.dataField in row)) row[column.dataField] = false;
            return (
                <ColorSelect {...editorProps} value={value} row={row} options={FeignTool.colorList} dataField={column.dataField} text={column.text} onColorChange={(name, color) => FeignTool.onColorChange?.(name, color)} />
            );
        },
    },
    {
        text: '名',
        dataField: 'name',
        sort: true,
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            let res = a[1] > b[1] ? 1 : (a[1] < b[1] ? -1 : 0);
            if (res === 0) res = a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
        editable: true,
        formatter: (cell, row) => {
            if (cell) {
                return <div className="tableCell" id={"name_tableid_" + row.id}><span className="might" style={FeignTool.optionbackground[cell[1]]}>{cell[0]}</span></div>;
            }
            return <div className="tableCell" id={"name_tableid_" + row.id}>　</div>;
        },
        editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) => {
            return (
                <InsaneSelect {...editorProps} value={value} row={row} options={FeignTool.roleLabel} optionBackgrounds={FeignTool.optionbackground} insaneRoleOptions={FeignTool.insaneRoleLabel} allRoleLabels={FeignTool.allRoleLabel} dataField={column.dataField} text={column.text} />
            );
        },
    },
    {
        text: '役',
        dataField: 'role',
        ...FeignTool.column_template,
        formatter: FeignTool.formatter_templete('role'),
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            const valueIsResultColor = (array) => {
                return (array && array.length && array[0][2] === 4);
            };
            const newvalue = (value, row) => {
                if (value && value.length) {
                    let nvalue = value.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return nvalue[0][0] + "z" + nvalue[0][1];
                }
                if (row.deadRole && row.deadRole.length) {
                    let nvalue = row.deadRole.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return nvalue[0][0] + "0" + nvalue[0][1];
                }
                return "";
            }
            const newa = newvalue(a, rowA);
            const newb = newvalue(b, rowB);
            const res = newa > newb ? 1 : (newa < newb ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
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
        sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (rowA.id < 0 || rowB.id < 0) return rowB.id - rowA.id;
            const valueIsResultColor = (array) => {
                return (array && array.length && array[0][2] === 4);
            };
            const newvalue = (value, row) => {
                if (value && value.length) {
                    let nvalue = value.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return "0" + nvalue[0][0] + nvalue[0][1];
                }
                if (row.role && row.role.length) {
                    let nvalue = row.role.slice();
                    while (valueIsResultColor(nvalue)) nvalue.shift();
                    if (nvalue.length) return "2" + nvalue[0][0] + nvalue[0][1];
                }
                return "1";
            }
            const newa = newvalue(a, rowA);
            const newb = newvalue(b, rowB);
            const res = newa > newb ? 1 : (newa < newb ? -1 : 0);
            if (order === 'asc') return res;
            else return -res;
        },
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


let FeignTool_tableData = FeignTool.tutorialData;
let FeignTool_nameList = createLegacyPlayerOptions(FeignTool.tutorialNameStringList, FeignTool.actionType.name);
let FeignTool_colorNameDic = {};
let FeignTool_playerIsIcon = true;
let FeignTool_nameIsIcon = true;
FeignTool.getColorNameDictionary = () => FeignTool_colorNameDic;
FeignTool.getTableData = () => FeignTool_tableData;
FeignTool.getPlayerOptions = () => FeignTool_nameList;
FeignTool.tutorialData.forEach((item) => {
    if (item.id < 0 || !("color" in item)) return;
    FeignTool_colorNameDic[item.name[0]] = item.color;
});

let FeignTool_popupWindow = null;

const FeignSupportToolRoot = () => {
    const [boardState, dispatch] = useReducer(boardReducer, undefined, () => createBoardState({ board: FeignTool.tutorialData, playerNames: FeignTool.tutorialNameStringList, isTutorial: true, dayCount: 2 }));
    const [tableRevision, setTableRevision] = useState(0);
    const [nameText, setNameText] = useState("");
    const PlayerIsIcon = boardState.display.playerIsIcon;
    const NameIsIcon = boardState.display.nameIsIcon;
    const { dayCount, isTutorial } = boardState;
    const [nameStringList, setNameStringList] = useState(FeignTool.tutorialNameStringList);
    const data = selectTableData(boardState);
    const columns = useMemo(() => selectTableColumns({ dayCount, isTutorial }, FeignTool.tableDefinition), [dayCount, isTutorial]);
    const syncLegacyBoard = (nextState) => {
        FeignTool_tableData = nextState.board;
        FeignTool_colorNameDic = selectColorByPlayerName(nextState);
        FeignTool_nameList = selectPlayerOptions(nextState, FeignTool.actionType);
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
    FeignTool.onColorChange = (playerName, color) => {
        applyBoardAction({ type: BOARD_ACTION.SET_PLAYER_COLOR, playerName, color });
        setTableRevision((revision) => revision + 1);
    };

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
        FeignTool_playerIsIcon = event.target.checked;
        dispatch({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "playerIsIcon", value: event.target.checked });
    };
    const nameIconChangeHandler = (event) => {
        FeignTool_nameIsIcon = event.target.checked;
        dispatch({ type: BOARD_ACTION.SET_DISPLAY_OPTION, option: "nameIsIcon", value: event.target.checked });
    };
    const onClickReset = () => {
        if (window.confirm("入力内容をリセットしますか？")) {
            const nextState = boardReducer({ ...boardState, board: data }, { type: BOARD_ACTION.RESET_BOARD, eventRows: FeignTool.ActionsNameList });
            dispatch({ type: BOARD_ACTION.REPLACE_STATE, state: nextState });
            syncLegacyBoard(nextState);
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
