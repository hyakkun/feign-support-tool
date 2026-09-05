# 盤面データモデルと移行仕様

## 目的

公開版の盤面編集、チュートリアル、メモ行、補助表示ウィンドウを維持したまま、役職と特殊イベントを安全に追加する。

現行のセル値は`[表示文字列, 陣営等の数値, 種別数値]`というタプルで、役職名の文字列比較によって入力候補を切り替えている。新しい役職・固定行を追加する際も、このツールは実行者や発生条件を自動で関連付けず、利用者が対象と主張を記録する形式を維持する。

## 現行形式と互換境界

公開版・開発版の既存盤面は、次の形式を使う。

```js
// プレイヤー行または固定イベント行
{
  id: 0,
  keyid: 0, // 公開版のみ。再描画制御にも使われる
  name: ["プレイヤー名", 19],
  color: ["/icon/Blue.png", "#4b6fd7"],
  role: [["インベ", 1, 1]],
  deadRole: [["ボマー", 3, 1]],
  target_day1: [["対象名", 0, 2]],
  action_day1: [["結果", 0, 0]]
}
```

この既存形式をすぐに削除しない。最初は`legacyBoard`として読み込み、変換関数だけが新しいモデルを生成する。テーブル編集ライブラリの切替は、この互換変換とテストが完了した後に行う。

## 新しい盤面モデル

```ts
type Faction = "crew" | "imp" | "neutral";
type DisplayFaction = Faction | "unknown";
type RoleId = string;
type ResultCode =
  | "success"
  | "failure"
  | "unknown"
  | "arrested"
  | "trapped"
  | "at-home"
  | "visitor"
  | "revive"
  | "zero-people";
type AlignmentNote = { label: string };
type RoleAssignment = { roleId: RoleId; faction: DisplayFaction };

type Player = {
  id: string;
  name: string;
  color?: { iconPath: string; hex: string };
  alignment: AlignmentNote;
};

type Board = {
  schemaVersion: 1;
  players: Player[];
  rows: BoardRow[];
  days: number[];
};

type BoardRow = PlayerRow | EventRow | MemoRow;

type PlayerRow = {
  kind: "player";
  playerId: string;
  assignments: RoleAssignment[];
  days: Record<number, DayEntry>;
};

type EventRow = {
  kind: "event";
  eventType:
    | "exile"
    | "kill"
    | "explosion"
    | "doctor"
    | "conflict"
    | "line"
    | "self-destruct"
    | "chain-death";
  days: Record<number, DayEntry>;
};

type MemoRow = {
  kind: "memo";
  id: string;
  label: string;
  days: Record<number, DayEntry>;
};

type DayEntry = {
  targets: CellItem[];
  observations: CellItem[];
};
```

固定イベント行に`provoker`（挑発）は含めない。役職としての挑発者の情報は、プレイヤー行の役職・行動履歴へ記録する。

## 表示アイテム

```ts
type CellItem =
  | { kind: "role"; roleId: RoleId; faction: DisplayFaction }
  | { kind: "player"; playerId: string }
  | { kind: "result"; result: ResultCode }
  | { kind: "note"; text: string }
  | { kind: "marker"; marker: "insane" | "sane" | "important" | "revive" };
```

`CellItem`は表示・編集用の共通形式である。死亡に関する主張は、対象の人物を固定イベント行のセルへ入力する。追放・殺害と同じ入力経路を使うため、別のイベント関連データは持たない。

このツールはゲームの秘匿情報や閲覧権限を管理しない。すべての項目は、利用者が各参加者の主張・観測・確定情報を整理するために入力するメモである。したがって`private`／`public`の可視性はデータモデルに持たせない。

## イベント行と死亡表示

固定イベント行は`追放`、`殺害`、`爆発`、`道連れ`、`自爆`、`医者`、`対立`、`ライン`とする。`自爆`と`道連れ`は、追放・殺害と同じく対象人物を記録するだけの行である。実行者、ろうそくの対象、発生条件を別データとして関連付けたり、ツールが自動判定したりしない。

```ts
const eventRows = [
  { id: "exile", label: "追放", editor: "player-then-optional-dead-role" },
  { id: "kill", label: "殺害", editor: "player-then-optional-dead-role" },
  { id: "chain-death", label: "道連れ", editor: "player-then-optional-dead-role" },
  { id: "self-destruct", label: "自爆", editor: "player-then-optional-dead-role" },
];
```

役職が判明していない場合は人物だけを記録できる。死亡役職を追記したい場合だけ、追放・殺害と同様に人物行の死亡役欄へ反映する。自爆・道連れのための専用死体マーカーや人物間の関連データは持たない。補助表示ウィンドウでは、当日分の自爆・道連れ行に入力された対象人物をイベント要約として表示する。

## 役職カタログ

役職は表示名ではなく安定したIDで参照する。入力候補の分岐も役職名の比較ではなく`interaction`で定義する。

### 既存役職だけでの具体例

まず、公開版にある既存役職だけを次のように定義する。`actionItems`はゲームの真偽を判断するルールではなく、その役職を主張している行の行動欄で選びやすくする候補グループである。

```ts
type ActionItemGroup = "role" | "player" | "result";

const existingRoles: RoleDefinition[] = [
  // 緑（crew）・赤（imp）になり得る役職
  { id: "snitch", label: "ねずみ", factions: ["crew", "imp"], actionItems: ["role", "result"] },
  { id: "investigator", label: "インベ", factions: ["crew", "imp"], actionItems: ["role", "result"] },
  { id: "police", label: "ポリス", factions: ["crew", "imp"], actionItems: ["result"] },
  { id: "trapper", label: "トラッパ", factions: ["crew", "imp"], actionItems: ["result", "player"] },
  { id: "lookout", label: "ルック", factions: ["crew", "imp"], actionItems: ["player", "result"] },
  { id: "provoker", label: "挑発", factions: ["crew", "imp"], actionItems: ["result"] },

  // 緑固定・赤固定・青固定の役職
  { id: "doctor", label: "医者", factions: ["crew"], actionItems: ["result"] },
  { id: "insane", label: "バカ", factions: ["crew"], actionItems: ["result"] },
  { id: "blamer", label: "ブレイマ", factions: ["imp"], actionItems: ["result"] },
  { id: "cleaner", label: "クリーナ", factions: ["imp"], actionItems: ["result"] },
  { id: "serial-killer", label: "シリアル", factions: ["neutral"], actionItems: ["result"] },
  { id: "bomber", label: "ボマー", factions: ["neutral"], actionItems: ["result"] },
  { id: "thief", label: "シーフ", factions: ["neutral"], actionItems: ["role", "player", "result"] },
  { id: "survivor", label: "サバイバ", factions: ["neutral"], actionItems: ["result"] },
];
```

`？`は役職を限定できない場合のフォールバックとして扱い、`role`、`player`、`result`の全候補を出す。公開版の特殊な入力補助も、この表の`actionItems`で説明できる。

| 既存の主張 | 現在の入力補助 | カタログ上の表現 |
| --- | --- | --- |
| ねずみ／インベ | 役職候補と通常結果を選べる | `actionItems: ["role", "result"]` |
| ルック | 人物と通常結果を選べる | `actionItems: ["player", "result"]` |
| トラッパ | 通常結果と人物を選べる | `actionItems: ["result", "player"]` |
| シーフ | 役職・人物・通常結果を選べる | `actionItems: ["role", "player", "result"]` |
| それ以外 | 通常結果を選べる | `actionItems: ["result"]` |

既存の固定イベント行も、役職とは別のカタログとして定義する。

```ts
const existingEventRows = [
  { id: "exile", label: "追放", editor: "player-then-optional-dead-role" },
  { id: "kill", label: "殺害", editor: "player-then-optional-dead-role" },
  { id: "explosion", label: "爆発", editor: "player-or-revive" },
  { id: "chain-death", label: "道連れ", editor: "player-then-optional-dead-role" },
  { id: "self-destruct", label: "自爆", editor: "player-then-optional-dead-role" },
  { id: "doctor", label: "医者", editor: "player-or-revive" },
  { id: "conflict", label: "対立", editor: "freeform" },
  { id: "line", label: "ライン", editor: "freeform" },
];
```

これは公開版の`DeadSelect`に相当する。`追放`、`殺害`、`自爆`、`道連れ`で人物、続けて死亡役職を入力すると、その人物行の死亡役欄へ役職を表示する。ツールはその主張の真偽を判定しない。

### 既存役職だけの盤面例

次は、アリスがルック、ボブがボマーという主張と、1日目にボブが追放されたという記録である。これは公開版にある機能だけで表現できる。

```ts
const board: Board = {
  schemaVersion: 1,
  players: [
    { id: "alice", name: "アリス", alignment: { label: "不明" } },
    { id: "bob", name: "ボブ", alignment: { label: "青確" } },
  ],
  days: [1],
  rows: [
    {
      kind: "player",
      playerId: "alice",
      assignments: [{ roleId: "lookout", faction: "crew" }],
      days: {
        1: {
          targets: [{ kind: "player", playerId: "bob" }],
          observations: [
            { kind: "player", playerId: "bob" },
            { kind: "result", result: "success" },
          ],
        },
      },
    },
    {
      kind: "player",
      playerId: "bob",
      assignments: [{ roleId: "bomber", faction: "neutral" }],
      days: { 1: { targets: [], observations: [] } },
    },
    {
      kind: "event",
      eventType: "exile",
      days: {
        1: {
          targets: [{ kind: "player", playerId: "bob" }],
          observations: [{ kind: "role", roleId: "bomber", faction: "neutral" }],
        },
      },
    },
  ],
};
```

この例で使う型はすべて既存機能に対応している。新役職のために、盤面全体の構造や既存の役職・追放処理を作り直す必要はない。

### 新役職を同じ形式へ追加する例

新役職は、原則として`RoleDefinition`の1件追加と、既存の`CellItem`の組み合わせで表現する。

```ts
type RoleDefinition = {
  id: RoleId;
  label: string;
  legacyLabels?: string[];
  factions: Faction[];
  image?: string;
  actionItems: ActionItemGroup[];
  interaction?: Interaction;
};

type Interaction =
  | { kind: "observe-visit"; target: "player"; result: "zero-or-one-player" }
  | { kind: "guess-role"; target: "player"; prediction: "role"; outcomes: ["correct", "incorrect"] }
  | { kind: "place-candle"; target: "player" };
```

新役職の定義は次のとおりとする。

| ID | 表示名 | 陣営 | `interaction` |
| --- | --- | --- | --- |
| `tracker` | トラッカー | `crew`, `imp` | `actionItems: ["player", "result"]`。結果なしは`{ kind: "result", result: "zero-people" }`、人物ありは既存の`{ kind: "player" }`で記録する |
| `magician` | 魔術師 | `neutral` | `actionItems: ["player", "role", "result"]`。対象・予想役職・成功／失敗を既存のセル種別で記録し、結果と自爆は利用者が行動欄・`自爆`行へ記録する |
| `haunter` | ホーンター | `neutral` | `actionItems: ["player", "result"]`。ろうそく設置は対象人物と任意メモで記録し、道連れは利用者が`道連れ`行へ対象人物だけを記録する。`legacyLabels: ["ゴースト"]` |

トラッカーと魔術師には新しいセル種別は不要である。必要な追加は、トラッカー用の結果コード`zero-people`と、魔術師用の役職定義である。

ホーンターのために新しいセル種別や人物間の関連データは追加しない。前日の`追放`行と当日の`道連れ`行を盤面上で見比べて考察する。

## 補助表示ウィンドウ

公開版の補助ウィンドウは、親画面からプレイヤー、色、日数を受け取り、プレイヤー別の表示を並べ替える。盤面の真実を別に保持しない表示専用コンポーネントとする。

### 固定イベントの要約表示

メイン盤面の自爆・道連れ行は、追放・殺害と同じ表示・入力方式を維持する。死体マーカーやプレイヤー行への特別な装飾は追加しない。

補助表示ウィンドウには、選択中の日について次のイベント要約欄を表示する。

```ts
type PopupEventSummary = {
  eventType: "self-destruct" | "chain-death";
  label: "自爆" | "道連れ";
  targets: string[];
};
```

`targets`は各固定イベント行のセルに入力された人物名だけから抽出する。死亡役職が追記されていても、イベント要約の主情報は人物名とする。自爆・道連れを入力していない場合は要約欄を表示しない。

この要約は「自爆: アリス」「道連れ: ボブ」のように表示する。実行者、追放日、ろうそくの対象、成否、死亡理由を推論・関連付けない。ポップアップは盤面の読み取り専用スナップショットから要約を生成し、盤面データを変更しない。

移植時は`window.document`へ直接代入する既存方式ではなく、`postMessage`でバージョン付きの読み取り専用スナップショットを送る。

```ts
type DisplaySnapshot = {
  schemaVersion: 1;
  players: Player[];
  day: number;
  rows: BoardRow[];
  events: PopupEventSummary[];
};
```

ポップアップがブロックされた場合でも、盤面編集は継続できる。補助ウィンドウは盤面状態を変更しない。

## 段階移行

1. `roles`、`events`、`board`の定数・変換関数を追加する。
2. 既存タプルを`CellItem`へ読み込むアダプターと、既存テーブルが読める形式へ戻すアダプターを作る。
3. 公開版のチュートリアル、メモ行、死亡処理、補助ウィンドウをアダプター経由で再現する。
4. 役職選択・対象／結果選択を役職カタログから生成する。
5. トラッカー、魔術師、ホーンターを追加し、補助表示ウィンドウのイベント要約を実装する。
6. 旧タプル形式を編集経路から取り除く。互換読み込みは保存・インポート機能が導入されるまで保持する。

## 今後の検討事項

### 旧役職セレクターの内部制御項目

現行の旧UI互換アダプターは、役職選択メニュー内に`Hoge`という内部用の選択肢を含める。これは実在する役職ではなく、`crew`／`imp`／`neutral`／`none`の陣営切替ボタンを表示するためのセンチネルである。

この実装は表示名の文字列比較に依存しており、役職カタログの安定ID設計とは整合しない。現行のテーブル編集コンポーネントを維持する間は互換性のため残すが、新しい編集UIへ移行する際には、陣営フィルターを独立したコントロールとして実装し、`Hoge`と`defaultRoletype1`〜`3`への依存を削除する。

## テストの最小セット

- 公開版のチュートリアル盤面を変換・再表示できる。
- 追放・殺害による死亡役の反映を維持できる。
- トラッカーは「対象」と「0人または1人の結果」を別の入力として保持できる。
- 魔術師の役職予想と結果を記録でき、`自爆`行へ対象人物を記録できる。
- ホーンターのろうそく対象を任意メモで記録でき、`道連れ`行へ対象人物を記録できる。
- 入力内容からキル・自爆・道連れを自動実行または真偽判定しない。
- 補助ウィンドウ向けのスナップショットに、盤面を変更する操作が含まれない。
