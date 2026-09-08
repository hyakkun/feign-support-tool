# 盤面状態アーキテクチャ

## 目的

`index.js` に混在している盤面データ、色辞書、名前一覧、表示設定、ポップアップ送信を分離し、役職追加・UI改善・依存関係更新を安全にする。画面や既存の盤面保存形式を一度に置き換えない。

## 設計判断

- React の `BoardState` を可変状態の唯一の正本にする。
- `FeignTool_tableData`、`FeignTool_nameList`、`FeignTool_colorNameDic` のような可変モジュール変数は、段階移行後に廃止する。
- `react-bootstrap-table-next` が必要とする既存タプル形式は、当面 `BoardState` から導出する互換ビューとして維持する。
- 役職・イベント・結果などの不変設定は `boardConfig`、`roleCatalog`、`eventRows` に置く。`BoardState` には複製しない。
- ポップアップは別の状態を持たず、現在の `BoardState` から作ったスナップショットを受け取る。

## 状態の境界

```ts
type BoardState = {
  board: LegacyBoardRow[];       // 移行中の正本。将来は domain-model.md の Board へ変換する
  playerNames: string[];         // 入力順の参加者名。board から検証できるが編集操作に必要
  display: {
    playerIsIcon: boolean;
    nameIsIcon: boolean;
  };
  isTutorial: boolean;
  dayCount: number;
};

type LegacyBoardRow = {
  id: number;
  keyid: number;
  name: [string, number];
  color?: LegacyColor;
  role?: LegacyCellItem[];
  deadRole?: LegacyCellItem[];
  [dayField: `target_day${number}` | `action_day${number}`]: LegacyCellItem[];
};

type LegacyColor = [iconPath: string, hex: string];
type LegacyCellItem = [label: string, displayType: number, itemType: number, playerRowId?: number];
```

色辞書は `board` のプレイヤー行の `color` から `selectColorByPlayerName` で導出する。`BoardState` に重複して保持しない。

## 操作

操作は reducer または同等の純粋関数として定義し、UI コンポーネントは操作を dispatch するだけにする。

| 操作 | 入力 | 主な更新 |
| --- | --- | --- |
| `setPlayerNames` | 改行入力または名前配列 | 参加者行の追加・削除・保持、選択肢更新 |
| `setPlayerColor` | 名前、色 | 該当プレイヤーの色、色辞書 |
| `updateCell` | 行 ID、日、列、セル値 | 盤面の一セル |
| `recordDeathRole` | 対象、役職、固定役職か | 死亡役職、アニメーション用トークン |
| `addDay` | なし | `dayCount` と日別列 |
| `addMemoRow` | なし | 新しいメモ行 |
| `resetBoard` | なし | 色を維持して役職・行動・メモを初期化 |
| `setDisplayOption` | 表示種別、真偽 | `display` のみ |

現在 `playerRows`、`eventRows`、`boardOperations` にある純粋関数は、これらの操作実装の基礎として再利用する。

## Selector と互換アダプター

React コンポーネントは可能な限り state 全体を受け取らず、次の selector を通じて必要な値を得る。

```ts
selectTableData(state): LegacyBoardRow[]
selectPlayerOptions(state): LegacyOption[]
selectColorByPlayerName(state): Record<string, LegacyColor>
selectColumns(state, formatters): TableColumn[]
selectPopupSnapshot(state, day): PopupSnapshot
```

既存テーブルへの入力は `selectTableData`、ポップアップ送信は `selectPopupSnapshot` を使う。これにより、テーブルライブラリを将来置き換えても reducer とドメイン操作を維持できる。

## コンポーネント境界

移行後の責務は次のように分ける。

```text
FeignSupportToolRoot
├─ BoardToolbar        : 翌日、メモ行、表示設定
├─ BoardTable          : テーブルライブラリとの互換アダプター
│  ├─ ColorSelect
│  ├─ InsaneSelect
│  ├─ RoleSelect
│  └─ DeadSelect
├─ NameInputPanel      : 名前入力、setName、リセット、補助表示起動
├─ MemoArea
└─ PopupBridge         : ポップアップへ snapshot を送信
```

`RoleSelect` と `DeadSelect` は state を直接変更しない。選択結果を `onUpdateCell`、死亡役職の結果を `onRecordDeathRole` で親へ通知する。これが完全なファイル分離の前提である。

## 段階的な移行

1. 完了: 現行テストを基準として `BoardState` と selector の仕様をテストで定義した。
2. 完了: `display` と `dayCount` を reducer 管理へ移した。
3. 完了: `board`、`playerNames`、色辞書の導出を `useReducer` と selector へ移した。テーブルに渡す個別の `data` state は廃止済みである。
4. 完了: ポップアップ送信を `popupBridge` へ分離した。
5. 完了: `BoardTable`、`NameInputPanel`、`RoleSelect`、`DeadSelect` を分離した。
6. 未着手: legacy タプルと `domain-model.md` の `Board` を相互変換する関数を追加し、保存・描画を段階的に移行する。

各段階で `npm test`、`npm run build`、名前設定・役職入力・自爆/道連れ・ポップアップのブラウザ確認を行う。段階 3 以前にテーブルライブラリや React の更新を開始しない。

## 現在の移行状況

2026-09 時点で、盤面の正本は `BoardState` であり、次の操作は `boardReducer` を通じて更新する。テーブルに渡す `data` の個別 state は廃止済みである。

- 新規盤面作成、参加者更新、色変更、通常セル更新
- 追放・殺害・道連れの死亡役職記録、および自爆時の魔術師の自動記録
- メモ行追加、翌日追加、リセット、表示設定
- ポップアップ用スナップショットの生成・送信（`popupBridge`）
- `BoardTable`、`NameInputPanel`、`RoleSelect`、`DeadSelect` の分離

`BoardTable` と `NameInputPanel` は callback の接続を、`popupBridge` は送信内容を単体テストで固定している。役職・死亡イベントの詳細な選択手順は既存の純粋関数テストとブラウザ確認で担保する。

`FeignTool_tableData`、`FeignTool_nameList`、`FeignTool_colorNameDic` は、既存テーブルの formatter と editor の互換アダプターとして残る。`syncLegacyBoard` で `BoardState` から同期し、`RoleSelect` と `DeadSelect` には getter を含む設定 props として渡す。テーブルライブラリは編集途中に行データを可変更新するため、保存完了までは一時的に同じ盤面参照を利用する。

## 今後の作業

優先順は次のとおりとする。

1. `columns` の生成を selector または専用モジュールへ移し、`dayCount` と日別列の二重管理を解消する。あわせて `rowStyle` と formatter の設定依存を `BoardTable` 側へ集約する。
2. `FeignTool_*` 互換アダプターを縮小する。まず formatter と editor が必要とする値を明示的な props／getter に置き換え、テーブル保存時の可変更新を `BoardTable` 内だけに閉じ込める。
3. 役職・対象・行動・死亡イベントについて、主要な選択手順を UI テストで追加する。現在の reducer／純粋関数テストとブラウザ確認を補完する。
4. 別ブランチで素の HTML `table` による `BoardTable` 試作を行い、現行アダプターとの機能比較と回帰確認を実施する。十分な同等性が得られるまで本線へは統合しない。
5. テーブル置換の完了後に、React、`react-scripts`、周辺依存を別の変更として更新する。

### 優先作業の進捗

- 優先度1は完了。日別列は `dayCount` から導出し、行背景色と formatter の設定はテーブル用モジュールへ分離した。
- 優先度2は getter 化まで完了。`legacyBoardRuntime` が `BoardState` から旧テーブル用の盤面、参加者候補、色、表示設定を導出する。テーブルライブラリによる編集途中の可変更新は、アニメーション用トークンとの互換性があるため、優先度4の置換試作で解消する。
- 優先度3は主要手順を完了。通常の人物入力、自爆、人物→役職の死亡イベント入力を `RoleSelect`／`DeadSelect` の UI テストで検証する。

## テーブルライブラリの将来方針

`react-bootstrap-table-next` と `react-bootstrap-table2-editor` は現時点では維持する。ただし、編集完了フックとテーブルの再マウントに依存する実装は盤面固有のセル編集と相性がよくないため、将来は取り除く方向とする。

置換を始める前に `BoardTable` を互換アダプターとして分離し、盤面、列、セル更新操作を props 契約へ限定する。その後、別ブランチで素の HTML `table` と React 管理のセルコンポーネントを試作し、役職入力、死亡イベント、メモ、表示切替、補助ウィンドウ表示の回帰を確認する。ソートなど汎用表機能の拡張が必要になった場合に限り、headless なテーブルライブラリも比較対象とする。

### ネイティブテーブル試作の結果

`experiment/native-board-table` で、`react-bootstrap-table-next` に依存しない `BoardTable` を試作した。既存の formatter と editor の props 契約を維持しつつ、セル編集、日付ヘッダーの昇順・降順ソート、メモ行追加、行の背景色を素の HTML `table` で実装している。

主要操作と周辺操作はブラウザで確認済みであり、置換の実現性は確認できた。一方、この試作は本線へ未統合であり、依存パッケージも意図的に残している。統合を決めた場合は、試作ブランチを `feature/board-state-foundation` に取り込んだ後、依存削除を別コミットで行い、ビルド・自動テスト・ブラウザ回帰確認を改めて実施する。

依存関係の更新とテーブル置換は同一変更に混在させない。

## 将来のディレクトリ構成

モジュール数の増加に対応し、テーブル置換の準備が整った段階で、責務ごとに次の構成へ段階的に移すことを検討する。現時点ではファイル移動を行わない。

```text
src/
├─ app/
│  └─ index.js                 # Root の組み立てだけ
├─ board/
│  ├─ state/
│  │  ├─ boardState.js
│  │  ├─ boardReducer.js
│  │  └─ boardOperations.js
│  ├─ model/
│  │  ├─ boardConfig.js
│  │  ├─ playerRows.js
│  │  ├─ eventRows.js
│  │  ├─ actionOptions.js
│  │  └─ roleCatalog.js
│  ├─ table/
│  │  ├─ BoardTable.js
│  │  ├─ tableFormatters.js
│  │  └─ editors/
│  │     ├─ RoleSelect.js
│  │     ├─ DeadSelect.js
│  │     ├─ ColorSelect.js
│  │     └─ InsaneSelect.js
│  └─ popup/
│     └─ popupBridge.js
├─ components/
│  └─ NameInputPanel.js
└─ test/                       # 共通テストヘルパーが必要になった場合のみ
```

テストは実装ファイルと同じディレクトリに置く。たとえば `boardReducer.js` と `boardReducer.test.js` を並べることで、変更対象と検証を近接させる。

移動は一括で行わない。まず `board/table/` と `board/table/editors/`、次に `board/state/` と `board/model/`、最後に root を `app/` へ移す。各段階で import の更新、`npm test`、`npm run build`、必要なブラウザ確認を完了させてから次へ進む。

## 非目標

- ゲーム上の真偽、秘匿情報、視点別可視性を state に追加しない。
- 暫定画像を公開用 state や設定へ含めない。
- この移行で盤面データの永続化方式や GitHub Pages のデプロイ方式を変更しない。
