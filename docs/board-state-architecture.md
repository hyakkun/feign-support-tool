# 盤面状態アーキテクチャ

## 目的

盤面データ、参加者、色、表示設定、ポップアップ表示を一つの状態から導出し、役職追加や UI 改善が既存の入力・表示を壊さない構成にする。

盤面の現行データ形式は維持し、保存・共有などの明確な利用経路が生じるまで、新しいドメインモデルへの変換は導入しない。

## 設計判断

- React の `BoardState` を盤面に関する可変状態の唯一の正本とする。
- 参加者候補、色辞書、テーブルデータ、ポップアップ表示は `BoardState` から selector で導出し、重複して保持しない。
- 役職、イベント、結果、チュートリアル盤面などの不変設定は `board/model/` に置き、`BoardState` に複製しない。
- 現行の legacy タプル形式は `BoardState` の `board` に保持し、`legacyBoardRuntime` を editor・formatter 向けの互換境界とする。
- ポップアップは独自の盤面状態を持たず、現在の `BoardState` から作る snapshot を受信して表示する。

## 状態の境界

```ts
type BoardState = {
  board: LegacyBoardRow[];       // 現行の盤面データ形式
  playerNames: string[];         // 入力順の参加者名
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

色辞書はプレイヤー行の `color` から `selectColorByPlayerName` で導出する。参加者候補も `playerNames` から導出するため、名前変更後の editor 候補とポップアップ表示は同じ状態を参照する。

## 操作

UI は reducer action またはそれを組み立てる hook を呼び出す。盤面の更新規則は UI コンポーネントに持たせない。

| 操作 | 入力 | 主な更新 |
| --- | --- | --- |
| `setPlayerNames` | 改行入力または名前配列 | 参加者行の追加・削除・保持、候補の再導出 |
| `setPlayerColor` | 名前、色 | 該当プレイヤーの色 |
| `updateCell` | 行 ID、日、列、セル値 | 盤面の一セル |
| `recordDeathRole` | 対象、役職、固定役職か | 死亡役職と死亡記録 token |
| `addDay` | なし | `dayCount` と日別列 |
| `addMemoRow` | なし | 新しいメモ行 |
| `resetBoard` | なし | 色を維持して役職・行動・メモを初期化 |
| `setDisplayOption` | 表示種別、真偽 | `display` |

自爆では `createCellSaveActions` が魔術師の死亡役職を自動記録する。追放・殺害・道連れは、イベント行に入力した人物から死亡役職記録を作る。

## Selector と互換アダプター

```ts
selectTableData(state): LegacyBoardRow[]
selectPlayerOptions(state): LegacyOption[]
selectColorByPlayerName(state): Record<string, LegacyColor>
selectTableColumns(state, tableDefinition): TableColumn[]
selectPopupSnapshot(state, day): PopupSnapshot
```

盤面描画は `selectTableData` と `selectTableColumns`、ポップアップ送信は `selectPopupSnapshot` を使う。`legacyBoardRuntime` はこれらの導出値を既存の editor・formatter が要求する getter 形式で提供する。互換形式への依存はこの境界に閉じ込める。

## コンポーネント境界

```text
FeignSupportToolRoot
├─ BoardTable
│  ├─ ColorSelect
│  ├─ InsaneSelect
│  ├─ RoleSelect
│  └─ DeadSelect
├─ MemoArea
└─ NameInputPanel

usePopupActions ──> popupWindowController / popupBridge
```

- `FeignSupportToolRoot` は state、盤面操作 hook、表示部品を接続する。
- `BoardTable` はセル編集中の UI 状態だけをローカルに持つ。保存時には callback を通じて reducer 操作へ戻す。
- `RoleSelect` と `DeadSelect` は state を直接変更せず、選択値を callback で親へ通知する。
- `usePopupActions` はポップアップの生成と snapshot 送信を統合し、`popupBridge` は送信内容の整形だけを担当する。

## 現在の実装状況

- `BoardState` と `boardReducer` が、参加者、色、通常セル、死亡役職、メモ行、日付、リセット、表示設定を管理している。
- 自爆時の魔術師の自動記録、追放・殺害・道連れの死亡役職記録、爆発・医者行の蘇生候補を実装している。
- ネイティブ HTML `table` の `BoardTable` が、セル編集、日付ヘッダーのソート、メモ行追加、行背景色を提供する。
- `react-bootstrap-table-next`、`react-bootstrap-table2-editor`、`reactstrap` は依存関係から除去済みである。
- `board/model/`、`board/state/`、`board/table/`、`board/popup/`、`components/`、`app/` の責務は [モジュール責務とディレクトリ設計](module-directory-design.md) に従う。

## テストと確認方針

純粋関数と reducer は単体テストで固定し、UI 境界では callback の接続と代表的な選択操作をテストする。現在は、次を自動テストで扱う。

- 色・表示設定、参加者名、日付列、リセット、メモ行
- 役職・対象・行動・死亡イベントの選択と自爆時の固定死亡役職
- テーブルの保存 callback、列定義、背景色、popup snapshot と window の起動待ち

変更時は `npm test`、`npm run build` を実行する。DOM や別ウィンドウに関わる変更では、名前変更後の候補更新、セル入力、リセット、ポップアップ更新をブラウザでも確認する。

## 今後の保守課題

1. 複数の UI 部品をまたぐ操作（名前・色変更後の候補更新、リセット後のポップアップ更新、日付ソート）を統合テストとして拡充する。
2. legacy タプルと [`domain-model.md`](domain-model.md) の `Board` の相互変換は、盤面の保存・復元・共有、または新しいドメイン機能を導入すると決めた時点で設計する。
3. React、`react-scripts`、その他の古い依存関係は、互換性調査、更新方針の決定、段階更新に分けて扱う。build 時の Node 非推奨警告と Browserslist 更新通知もこの課題に含める。
4. `legacyBoardRuntime` は editor・formatter が legacy getter を必要としなくなった時点で削除候補とする。先に UI の props 契約を保ったまま置換範囲を見極める。

## テーブル実装の方針

盤面はネイティブ `BoardTable` で表示する。状態管理と盤面操作はテーブル実装から独立しているため、列のリサイズ、フィルタ、ページングなどの汎用機能が必要になった場合に限り、headless なテーブルライブラリを比較対象とする。

## 非目標

- ゲーム上の真偽、秘匿情報、視点別可視性を state に追加しない。
- 暫定画像を公開用 state や設定へ含めない。
- 盤面データの永続化方式や GitHub Pages のデプロイ方式を、この状態設計だけを理由に変更しない。

## 保留条件

- legacy タプルと `Board` の相互変換、盤面の保存・復元・共有は、利用経路を導入すると決めた時点で着手する。
- 新役職の画像は、素材利用の確認と公開方針が確定するまで正式な公開用設定へ含めない。
