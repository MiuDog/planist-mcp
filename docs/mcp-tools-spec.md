# Planist-MCP Tools Specification (6-Page Types Architecture)

> **發想與規格藍圖：涵蓋 Doc、Sheet、Slide、Edgeless、Design、Dashboard 六大頁面型態之專用 MCP 工具矩陣**

---

## 1. 核心設計原則

1. **強型別語意工具 (Semantic Intent Tools)**：為每種頁面型態提供強型別、高階語意的操作工具，降低 AI 構造無效 JSON 的風險，維護人類審核面板 (Proposal View) 的可讀性。
2. **異質資料結構隔離 (Divergent Structure Isolation)**：各頁面型態未來底層資料結構獨立演進，MCP 保持穩定抽象語意介面，內部轉譯由 Planist Host 處理。
3. **動態模組化工具包 (Modular Toolsets)**：按 `PageKind` 獨立分包，AI 依據當前開啟的頁面類型動態加載工具包，避免提示詞 Context Token 浪費。
4. **精確度分流**：
   - **Edgeless**：AI 提供資料與概略區域位置，由 Planist 本機演算法自動處理精確對齊與排版。
   - **Design**：AI 完全掌握並輸出精確座標 `(x, y, width, height)`、向量屬性與 UI 結構。

---

## 2. 工具分類矩陣 (6-Page MCP Tools Matrix)

### Module 0: Workspace Lifecycle (全域生命週期)

| 工具名稱 | 輸入參數 | 描述 |
|---|---|---|
| `planist_list_pages` | `filterKind?` | 列出目前專案內所有頁面 (包含 title, pageId, kind)。 |
| `planist_create_page` | `kind, title, initialData?` | 建立指定 Kind (`docs`, `sheet`, `slide`, `edgeless`, `design`, `dashboard`) 的全新頁面。 |
| `planist_convert_page_kind` | `pageId, targetKind` | 執行 Derived Kind Conversion (依據 ADR-0031 建立新 Page ID 副本)。 |

---

### Module 1: Doc (文件頁面工具包)

| 工具名稱 | 輸入參數 | 描述 |
|---|---|---|
| `doc_read_ast` | `pageId` | 讀取文件的區塊樹 (Block AST) 與 Markdown 內容。 |
| `doc_append_section` | `pageId, headingTitle, markdownContent` | 在文件末尾追加新章節。 |
| `doc_propose_diff` | `pageId, summary, blockDiffs` | 提交文件編輯提案 (Proposal) 供人類審核。 |

---

### Module 2: Sheet (試算表頁面工具包)

| 工具名稱 | 輸入參數 | 描述 |
|---|---|---|
| `sheet_read_range` | `pageId, range (e.g. "A1:D20")` | 讀取指定儲存格區域的數值與公式。 |
| `sheet_update_cells` | `pageId, cells: [{ cell: "B2", value, formula }]` | 更新特定儲存格的數值或計算公式。 |
| `sheet_create_chart_projection` | `pageId, sourceRange, chartType` | 將試算表數據轉化為圖表卡片投影。 |

---

### Module 3: Slide (簡報頁面工具包)

| 工具名稱 | 輸入參數 | 描述 |
|---|---|---|
| `slide_list_slides` | `pageId` | 取得所有投影片頁面、頁碼與佈局範本。 |
| `slide_create_from_markdown` | `pageId, slidesMarkdown` | 依據 Markdown 結構化語法生成簡報投影片與樣式渲染標籤。 |
| `slide_set_speaker_notes` | `pageId, slideIndex, notes` | 設定特定投影片的演講者講稿 (Speaker Notes)。 |

---

### Module 4: Edgeless (無限畫布頁面工具包)

| 工具名稱 | 輸入參數 | 描述 |
|---|---|---|
| `edgeless_get_spatial_summary` | `pageId` | 取得畫布上節點卡片、連接線與手繪圖層的概略佈局資訊。 |
| `edgeless_add_nodes_approximate` | `pageId, region ("top-left", "center"), data` | 傳送節點資料與概略區域，由 Planist 自動演算法進行畫布卡片排版。 |
| `edgeless_connect_nodes` | `pageId, sourceNodeId, targetNodeId, label` | 在畫布節點之間建立邏輯連接線 (Connectors)。 |
| `edgeless_add_ink_overlay` | `pageId, strokePathData` | 在畫布的透明手繪圖層 (Ink Overlay Sheet) 寫入向量筆觸。 |

---

### Module 5: Design (UI/UX 設計頁面工具包)

| 工具名稱 | 輸入參數 | 描述 |
|---|---|---|
| `design_get_ui_tree` | `pageId` | 完整獲取 UI 設計頁面的所有元件樹、精確座標與屬性。 |
| `design_create_frame` | `pageId, name, x, y, width, height, layoutRules` | 建立包含精確幾何座標的 UI 設計框架 (Frame Container)。 |
| `design_update_vector_shape` | `pageId, elementId, styleProps, vectorGeometry` | 修改特定 UI 元件的精確座標、向量圖形、漸層與色彩屬性。 |
| `design_export_svg` | `pageId, frameId` | 將特定設計框架匯出為靜態 SVG 向量預覽圖。 |

---

### Module 6: Dashboard (儀表板頁面工具包)

| 工具名稱 | 輸入參數 | 描述 |
|---|---|---|
| `dashboard_apply_layout` | `pageId, layoutPreset` | 依據 Planist 視覺規範設寫入儀表板排版網格。 |
| `dashboard_add_kpi_card` | `pageId, title, metricVariable, format` | 建立 KPI 指標卡並綁定資料變數。 |
| `dashboard_bind_chart_widget` | `pageId, chartType, dataBinding, filterRef` | 加入圖表元件 (Bar/Line/Pie) 並綁定資料來源與篩選條件。 |

---

## 3. 實作架構示意

```text
planist-mcp/
├── src/
│   ├── index.ts                 # MCP Server 入口 (Stdio / Transport)
│   ├── modules/
│   │   ├── workspace.ts         # Module 0: Lifecycle
│   │   ├── doc.ts               # Module 1: Doc Tools
│   │   ├── sheet.ts             # Module 2: Sheet Tools
│   │   ├── slide.ts             # Module 3: Slide Tools
│   │   ├── edgeless.ts          # Module 4: Edgeless Tools (Approximate Layout)
│   │   ├── design.ts            # Module 5: Design Tools (Exact Coordinates)
│   │   └── dashboard.ts        # Module 6: Dashboard Tools (KPI & Variables)
│   └── client/
│       └── planist-api.ts       # Planist 本機 REST/JSON-RPC Client (127.0.0.1)
└── docs/
    └── mcp-tools-spec.md        # 本規格文件
```
