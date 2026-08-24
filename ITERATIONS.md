# Mystikos Admin 迭代记录

本文件按时间顺序记录每次迭代的目标、范围、关键决策、实际变更、验证结果和后续事项。尚未完成的内容必须明确标记，不应描述为已经实现。

## 2026-08-24：双主题统一视觉重构

### 状态

设计已确认，待实施第一步。

### 背景与目标

Naive UI 第一阶段已经验证了表格、筛选、分页、弹窗和消息组件，但框架默认深色组件与现有 Mystikos 页面色阶、密度和边框语言仍有割裂。此次重构建立浅色、深色两套正式主题，以统一视觉 Token 同时驱动 Naive UI 和现有 CSS，再按页面分批迁移，避免继续通过零散覆盖修补局部样式。

目标包括：

- 浅色与深色主题都具有独立、完整的表面层级和交互状态，不使用简单反色。
- 统一页面背景、卡片、浮层、边框、文字、悬浮、选中、阴影和语义状态颜色。
- 统一输入框、下拉框、按钮、表格、分页、弹窗、确认框和消息提示的尺寸与视觉语言。
- 保留 Mystikos 紫色品牌和深色侧边栏，同时让主内容区跟随主题切换。
- 保持现有字段、接口、权限、路由和业务操作流程不变。

### 主题架构

- 在 `src/theme/` 集中维护品牌基础色及浅色、深色语义 Token。
- 语义 Token 至少覆盖 `page`、`surface`、`surfaceRaised`、`surfaceMuted`、`border`、`borderStrong`、`text`、`textMuted`、`hover`、`selected`、`shadow`、`success`、`warning`、`error` 和 `info`。
- 从同一套 Token 生成浅色与深色 Naive UI `GlobalThemeOverrides`；根级 `NConfigProvider` 根据现有 Pinia 主题状态选择对应主题覆盖。
- 根应用通过 CSS 变量暴露当前语义 Token，现有布局与品牌组件逐步改用这些变量。
- 迁移期间允许旧页面继续运行，但不再增加新的零散 `.dark` 颜色硬编码。
- 主题切换继续使用现有 Pinia 状态与本地存储，不改变用户偏好逻辑。

### 视觉规范

- 中型交互控件统一为 38–40px，高频筛选工具栏使用紧凑但可读的 36–38px 高度。
- 卡片使用 12–14px 圆角、轻边框和低强度阴影；深色主题通过三级表面色建立层次，避免大片纯黑。
- 页面工具栏与卡片标题整合，筛选控件使用一致的背景、边框、焦点环和间距。
- 表头弱化背景对比，正文行使用轻分隔和统一 hover，斑马纹只保留极低对比度。
- 状态标签使用低饱和语义底色与清晰文字色，避免在深色表格中形成高亮白块。
- 侧边栏始终保持深色品牌区，浅色主题降低侧栏与内容区的突兀对比；顶部栏、页面标题和统计卡片随主题切换。
- 遵守现有表格局部横向滚动约束，不能重新引入 document 级横向滚动。

### 分阶段实施

#### 第一步：主题基础、布局壳层与订单页视觉基准

- [ ] 建立浅色、深色语义 Token 和对应 Naive UI 主题覆盖。
- [ ] 调整根级 Provider，使 CSS 变量与 Naive UI 组件同步切换。
- [ ] 统一页面背景、顶部栏、卡片、统计卡片和订单页工具栏的表面层级。
- [ ] 美化订单页输入、状态选择、按钮、表格、状态标签、分页和表单弹窗。
- [ ] 保持订单页搜索、筛选、增删改、刷新、分页和导出逻辑不变。
- [ ] 增加浅色、深色 Token、主题切换与订单视觉契约测试。
- [ ] 在浏览器检查两套主题、表格 hover/滚动、弹窗、筛选和控制台。

#### 第二步：服务端业务页面迁移

- [ ] 迁移用户管理、陪玩师管理和身份申请审核页面的筛选、表格、分页、弹窗和确认交互。
- [ ] 保持服务端分页、接口参数、权限和错误处理不变。
- [ ] 抽取首批迁移中已经稳定且重复的项目级组件封装。

#### 第三步：其余模块迁移

- [ ] 迁移商品、财务、报表和设置等本地 Mock 页面。
- [ ] 统一工作台图表、空状态和数据卡片的双主题表现。
- [ ] 清理已无页面使用的旧通用组件和兼容样式。

### 数据与交互边界

- 本次视觉重构不新增或修改后端 API。
- 订单、商品、财务、报表和设置仍使用本地 Mock，文档不得描述为服务端持久化。
- 用户、陪玩师和身份申请页面继续使用现有 Mystikos Server API。
- 主题切换、表格滚动和所有既有操作必须保持键盘可访问性和清晰焦点状态。

### 验证策略

- 使用 Vitest 验证语义 Token、根级 Provider、主题状态切换和订单页现有交互。
- 使用布局回归测试验证页面宽度收缩与表格局部滚动。
- 每一步至少运行 `npm run test -- --reporter=dot`、`npm run lint`、`npm run build` 和 `git diff --check`。
- 页面变更必须启动开发服务器，在浏览器分别检查浅色和深色；若真实登录守卫阻止访问，必须明确记录受限项。

### 第一步实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立统一的浅色、深色语义主题，并以布局壳层和订单页作为首个完整视觉基准。

**Architecture:** `src/theme/tokens.ts` 只负责主题数据与 CSS 变量映射，`src/theme/naive.ts` 只负责把 Token 转换为 Naive UI 覆盖。`App.vue` 根据 Pinia 主题状态同时选择 Naive UI 主题和根级 CSS 变量，现有布局与订单样式消费同一组变量。

**Tech Stack:** Vue 3、TypeScript、Pinia、Naive UI、CSS、Vitest、Vue Test Utils。

**Spec:** `ITERATIONS.md` 的“2026-08-24：双主题统一视觉重构”。

#### 全局约束

- 不修改订单字段、Mock 数据、CRUD 逻辑、API、路由或认证流程。
- 不迁移用户、陪玩师、身份申请及其他业务页面的交互组件。
- 不使用 document 级 `overflow-x: hidden` 掩盖表格溢出。
- 保留现有 Pinia 主题持久化与侧边栏行为。
- 保留未跟踪的 `pnpm-lock.yaml`，不纳入 npm 工作流。
- 每个代码任务完成后同步更新本计划复选框，最终同步 README 变更记录。

---

#### 任务 1：双主题 Token 与根级 Provider

**文件：**

- 新建 `src/theme/tokens.ts`
- 新建 `src/theme/naive.test.ts`
- 修改 `src/theme/naive.ts`
- 修改 `src/App.vue`
- 修改 `src/App.test.ts`

**接口：**

- 产出 `ThemeTokens`、`lightThemeTokens`、`darkThemeTokens`。
- 产出 `createThemeCssVars(tokens): Record<string, string>`。
- 产出 `createNaiveThemeOverrides(tokens): GlobalThemeOverrides`、`lightNaiveThemeOverrides`、`darkNaiveThemeOverrides`。
- `App.vue` 根据 `dark` 选择 Token、Naive UI 的 `darkTheme` 和根级 CSS 变量。

- [ ] **步骤 1：编写 Token 与主题切换失败测试**

```ts
expect(lightThemeTokens.page).toBe('#f4f6fb')
expect(darkThemeTokens.page).toBe('#0f121a')
expect(createThemeCssVars(darkThemeTokens)['--app-surface']).toBe('#181c27')
expect(createNaiveThemeOverrides(darkThemeTokens).common?.cardColor).toBe('#181c27')
```

在 `App.test.ts` 中挂载真实 `App`，断言 `.theme-root` 初始为 `data-theme="light"`；调用 `useAppStore().toggleDark()` 后等待 `nextTick()`，断言变为 `data-theme="dark"` 且 `--app-page` 为 `#0f121a`。

- [ ] **步骤 2：运行失败测试**

运行：

```bash
npm run test -- src/theme/naive.test.ts src/App.test.ts --reporter=verbose
```

预期：因 `tokens.ts`、双主题覆盖与 `.theme-root` 尚不存在而失败。

- [ ] **步骤 3：实现语义 Token 与映射**

`ThemeTokens` 必须使用以下完整接口：

```ts
export interface ThemeTokens {
  primary: string
  primaryHover: string
  primaryPressed: string
  page: string
  surface: string
  surfaceRaised: string
  surfaceMuted: string
  border: string
  borderStrong: string
  text: string
  textMuted: string
  hover: string
  selected: string
  shadow: string
  shadowSubtle: string
  tableHover: string
  tableStriped: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  error: string
  errorSoft: string
  info: string
  infoSoft: string
}
```

根级 CSS 变量使用 `--app-*` 前缀，并完整映射布局和状态标签需要的值：

```ts
export function createThemeCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    '--app-page': tokens.page,
    '--app-surface': tokens.surface,
    '--app-surface-raised': tokens.surfaceRaised,
    '--app-surface-muted': tokens.surfaceMuted,
    '--app-border': tokens.border,
    '--app-text': tokens.text,
    '--app-text-muted': tokens.textMuted,
    '--app-hover': tokens.hover,
    '--app-selected': tokens.selected,
    '--app-shadow': tokens.shadow,
    '--app-shadow-subtle': tokens.shadowSubtle,
    '--app-table-hover': tokens.tableHover,
    '--app-table-striped': tokens.tableStriped,
    '--app-success': tokens.success,
    '--app-success-soft': tokens.successSoft,
    '--app-warning': tokens.warning,
    '--app-warning-soft': tokens.warningSoft,
    '--app-error': tokens.error,
    '--app-error-soft': tokens.errorSoft,
    '--app-info': tokens.info,
    '--app-info-soft': tokens.infoSoft,
  }
}
```

浅色基础表面值固定为 `#f4f6fb`、`#ffffff`、`#ffffff`、`#f7f8fc`；深色固定为 `#0f121a`、`#181c27`、`#1d2230`、`#202532`。品牌主色固定为 `#7257df`。

- [ ] **步骤 4：实现 Naive UI 双主题覆盖与根级同步切换**

`createNaiveThemeOverrides` 至少覆盖 `common` 的 `bodyColor`、`cardColor`、`modalColor`、`popoverColor`、`inputColor`、`tableColor`、`tableHeaderColor`、`tableColorHover`、`tableColorStriped`、`dividerColor`、`borderColor`、`textColor1`、`textColor2`、`textColor3`，并统一 Button、Input、DataTable、Card 和 Pagination 的中型尺寸及圆角。

`App.vue` 在 Provider 内增加：

```vue
<div class="theme-root" :data-theme="dark ? 'dark' : 'light'" :style="themeCssVars">
  <RouterView />
</div>
```

- [ ] **步骤 5：运行测试和构建**

```bash
npm run test -- src/theme/naive.test.ts src/App.test.ts --reporter=verbose
npm run build
```

预期：主题测试与生产构建通过。

- [ ] **步骤 6：提交主题基础**

```bash
git add src/theme src/App.vue src/App.test.ts
git commit -m "feat: add unified dual-theme tokens"
```

---

#### 任务 2：布局壳层与公共表面层级

**文件：**

- 修改 `src/styles/index.css`
- 修改 `src/styles/layout.css`
- 修改 `src/styles/business.css`
- 修改 `tests/layout.test.ts`

**接口：**

- 消费任务 1 提供的 `--app-*` CSS 变量。
- 保留兼容变量 `--bg`、`--card`、`--text`、`--muted`、`--line`、`--hover`，其值改为引用 `--app-*`。
- 产出统一的页面、顶部栏、Panel 和统计卡片表面层级。

- [ ] **步骤 1：扩展布局失败测试**

在测试根节点设置语义变量，创建 `.app`、`main > header`、`.panel` 和 `.business-stats article`，断言其计算背景和边框分别消费对应变量；保留现有 `main`、页面和表格宿主的滚动边界断言：

```ts
root.style.setProperty('--app-page', '#f4f6fb')
root.style.setProperty('--app-surface', '#ffffff')
root.style.setProperty('--app-border', '#e4e8f0')
root.style.setProperty('--app-text', '#172033')
root.style.setProperty('--app-text-muted', '#7d899d')
root.style.setProperty('--app-hover', '#f2f0fb')
expect(getComputedStyle(shell).backgroundColor).toBe('rgb(244, 246, 251)')
expect(getComputedStyle(panel).backgroundColor).toBe('rgb(255, 255, 255)')
expect(getComputedStyle(panel).borderColor).toBe('rgb(228, 232, 240)')
```

- [ ] **步骤 2：运行布局测试确认失败**

```bash
npm run test -- tests/layout.test.ts --reporter=verbose
```

预期：现有 `.app` 与 `.app.dark` 仍使用硬编码色值，新的语义表面断言失败。

- [ ] **步骤 3：切换布局与公共卡片到语义变量**

将 `.app` 的兼容变量改为：

```css
.app {
  --bg: var(--app-page);
  --card: var(--app-surface);
  --text: var(--app-text);
  --muted: var(--app-text-muted);
  --line: var(--app-border);
  --hover: var(--app-hover);
  background: var(--bg);
}
```

删除 `.app.dark` 中重复的表面硬编码。顶部栏增加轻边框和 `var(--app-shadow-subtle)`；Panel 与统计卡片使用 `var(--app-surface)`、`var(--app-border)`、`var(--app-shadow)`，不得改变布局尺寸和表格滚动规则。

- [ ] **步骤 4：运行布局与主题测试**

```bash
npm run test -- tests/layout.test.ts src/App.test.ts --reporter=verbose
npm run build
```

预期：两组测试和构建通过。

- [ ] **步骤 5：提交布局表面统一**

```bash
git add src/styles tests/layout.test.ts
git commit -m "style: unify themed application surfaces"
```

---

#### 任务 3：订单页视觉基准

**文件：**

- 修改 `src/theme/naive.ts`
- 修改 `src/styles/business.css`
- 修改 `src/components/StatusTag.vue`
- 修改 `src/components/StatusTag.test.ts`
- 修改 `src/views/orders/OrdersView.vue`
- 修改 `src/views/orders/OrdersView.test.ts`

**接口：**

- 消费任务 1 的 Naive UI 双主题覆盖和 `--app-*` CSS 变量。
- 保持 `useCrudList` 的现有接口及订单页全部业务操作不变。
- `StatusTag` 继续接受 `status` 与 `variant`，只调整语义类和视觉实现。

- [ ] **步骤 1：编写订单视觉契约失败测试**

在 `StatusTag.test.ts` 中验证“进行中”“待接单”“已完成”仍显示原文字并携带稳定的语义类：

```ts
expect(mount(StatusTag, { props: { status: '进行中' } }).classes()).toContain('status-info')
expect(mount(StatusTag, { props: { status: '待接单' } }).classes()).toContain('status-warning')
expect(mount(StatusTag, { props: { status: '已完成' } }).classes()).toContain('status-success')
```

在 `OrdersView.test.ts` 中继续使用真实 Naive UI Provider，并增加：

```ts
expect(wrapper.find('.order-toolbar').exists()).toBe(true)
expect(wrapper.find('.n-data-table').exists()).toBe(true)
expect(wrapper.find('[aria-label="状态筛选"]').exists()).toBe(true)
```

- [ ] **步骤 2：运行订单定向测试确认失败**

```bash
npm run test -- src/components/StatusTag.test.ts src/views/orders/OrdersView.test.ts --reporter=verbose
```

预期：现有状态标签尚无语义类，测试失败。

- [ ] **步骤 3：统一 Naive UI 高交互组件视觉**

在 `createNaiveThemeOverrides` 中为 Button、Input、Select、DataTable、Card、Modal、Pagination、Popconfirm 和 Message 提供一致的背景、边框、文字、圆角、hover 与焦点颜色。筛选控件高度固定为 38px，DataTable 正文字号为 13px、表头为 12px，表格斑马纹与 hover 使用 Token 中的低对比颜色。

- [ ] **步骤 4：重绘订单工具栏、表格与状态标签**

- 工具栏使用 `order-toolbar` 类，标题区与筛选区通过间距和弱分隔建立层级，不使用大块深灰输入底色。
- 输入宽度保持 220px，状态选择保持 130px，导出按钮使用中性次级样式。
- 订单 Panel、表格边界、分页和弹窗全部消费语义变量；保留 `.order-table-host { overflow-x: auto; }`。
- 状态标签背景使用 `--app-info-soft`、`--app-warning-soft`、`--app-success-soft`，文字使用对应语义色。
- 操作按钮采用低对比圆形 hover，危险操作只在 hover 和确认框中强调红色。

订单页样式至少包含以下视觉契约：

```css
.order-toolbar {
  background: var(--app-surface);
  border-bottom: 1px solid var(--app-border);
}

.business-status.status-info {
  color: var(--app-info);
  background: var(--app-info-soft);
}

.business-status.status-warning {
  color: var(--app-warning);
  background: var(--app-warning-soft);
}

.business-status.status-success {
  color: var(--app-success);
  background: var(--app-success-soft);
}
```

- [ ] **步骤 5：运行订单交互与布局回归测试**

```bash
npm run test -- src/components/StatusTag.test.ts src/views/orders/OrdersView.test.ts tests/layout.test.ts --reporter=verbose
npm run build
```

预期：状态、搜索、筛选、弹窗与局部滚动测试通过，构建通过。

- [ ] **步骤 6：提交订单视觉基准**

```bash
git add src/theme/naive.ts src/styles/business.css src/components/StatusTag.vue src/components/StatusTag.test.ts src/views/orders
git commit -m "style: polish themed order management"
```

---

#### 任务 4：文档与完整验证

**文件：**

- 修改 `README.md`
- 修改 `ITERATIONS.md`

**接口：**

- README 描述当前真实实现，仅把第一步标记为完成。
- 本迭代第二步和第三步保持未完成状态。

- [ ] **步骤 1：同步文档**

更新 README 的主题说明、订单页视觉说明和变更记录；勾选本迭代第一步已完成项，填写实际修改、验证结果、浏览器检查和已知限制。

- [ ] **步骤 2：运行完整验证**

```bash
npm run test -- --reporter=dot
npm run lint
npm run build
git diff --check
```

预期：全部命令退出码为 0。

- [ ] **步骤 3：浏览器验证**

启动 `npm run dev`，在浏览器分别检查浅色和深色下的页面背景、顶部栏、统计卡片、筛选控件、表格 hover、内部横向滚动、分页、创建弹窗和控制台。通过 `document.documentElement.scrollWidth === document.documentElement.clientWidth` 验证无全局横向溢出；若登录守卫阻止访问订单页，必须在本迭代“已知限制”中记录。

- [ ] **步骤 4：提交文档与验证记录**

```bash
git add README.md ITERATIONS.md
git commit -m "docs: record dual-theme visual baseline"
```

## 2026-08-24：Naive UI 第一阶段迁移

### 状态

第一阶段已完成，进入稳定观察。

### 目标

- 引入 Naive UI，建立与 Mystikos 现有视觉风格一致的 Vue 3 交互组件基础。
- 以订单管理页作为迁移试点，验证主题、表格、筛选、分页、弹窗和消息提示方案。
- 解决表格交互时页面出现 document 级横向滚动条的问题。
- 保留现有业务逻辑和数据边界，为其他模块后续分批迁移提供依据。

### 本期范围

- 使用 npm 安装并锁定 Naive UI。
- 在应用根部接入中文语言、日期语言、深浅主题和 Mystikos 紫色主题覆盖。
- 重构订单管理页的筛选控件、数据表格、分页、记录表单弹窗和操作提示。
- 为主内容区、订单页面和表格容器补齐宽度收缩及内部滚动约束。
- 增加与主题、订单交互和页面溢出相关的自动化测试。
- 同步维护 `README.md` 和本迭代记录。

### 不在本期范围

- 不迁移用户、陪玩师、身份申请、商品、财务、报表和系统设置页面。
- 不替换左侧导航、顶部栏、统计卡片、Lucide 图标和现有 `StatusTag`。
- 不接入订单后端 API；订单数据和增删改仍仅保存在浏览器内存中。
- 不删除其他页面仍在使用的通用表格、弹窗和 Toast 组件。

### 设计决策

- Naive UI 只负责高交互复杂度组件，现有 Mystikos CSS 继续负责品牌布局和视觉识别。
- 通过根级 `NConfigProvider` 统一语言、主题和组件变量，并对接现有 Pinia 深浅主题状态。
- 第一阶段在订单页直接验证 Naive UI 的组件 API；稳定后再决定哪些模式需要抽成项目级封装。
- 宽表格必须在自身容器内滚动，不允许通过固定页面最小宽度或隐藏 document 溢出来掩盖问题。
- 订单页必须保持当前本地 Mock 语义，文档不得描述为服务端持久化。

### 验收标准

- 订单页的搜索、状态筛选、新增、编辑、删除、刷新、分页展示和 CSV 导出保持可用。
- 深色与浅色主题下，Naive UI 控件与现有页面色彩、圆角和字号协调。
- 鼠标进入表格及出现表格内部滚动条时，document 不产生横向滚动。
- 其他页面的现有交互和视觉不发生回归。
- `npm run test`、`npm run lint` 和 `npm run build` 全部通过。
- 在浏览器中检查订单页、主题切换、弹窗、筛选、表格滚动和控制台。

### 实施计划

> **执行要求：** 使用测试驱动方式逐项实施，每个任务先验证失败场景，再写最小实现并运行相关测试。

**目标：** 在不改变其他业务模块的前提下，为应用接入 Naive UI，并完成订单管理页试点迁移与滚动边界修复。

**架构：** 根级 Provider 只提供语言、主题与消息上下文；订单页直接使用 Naive UI 组件验证交互模式；现有列表组合函数通过可选通知回调兼容 Naive UI 消息和原 Toast。页面布局与品牌视觉继续由现有 CSS 负责。

**技术栈：** Vue 3、TypeScript、Vite、Pinia、Naive UI、Vitest、Vue Test Utils。

**全局约束：** 订单数据继续来自 `src/mocks/orders.ts`；其他页面不得迁移；现有未跟踪 `pnpm-lock.yaml` 不纳入 npm 依赖变更；每项实质改动同步更新 README 和本文件。

#### 任务 1：Naive UI 主题基础

**文件：**

- 修改 `package.json`、`package-lock.json`
- 新建 `src/theme/naive.ts`
- 新建 `src/App.test.ts`
- 修改 `src/App.vue`

- [x] 编写主题失败测试，断言 Mystikos 主色通过根 Provider 提供给组件：

```ts
expect(mystikosThemeOverrides.common?.primaryColor).toBe('#7257df')
expect(mystikosThemeOverrides.common?.borderRadius).toBe('9px')
```

- [x] 运行 `npm run test -- src/App.test.ts --reporter=verbose`，确认 Provider 尚未覆盖主题时测试失败。
- [x] 使用 npm 安装 `naive-ui@^2.45.2`，建立以下主题接口，并在 `App.vue` 中接入 `NConfigProvider`、`NDialogProvider`、`NMessageProvider`、`zhCN`、`dateZhCN` 和 `darkTheme`：

```ts
export const mystikosThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#7257df',
    primaryColorHover: '#8067e7',
    primaryColorPressed: '#6548cf',
    borderRadius: '9px',
  },
}
```
- [x] 再次运行主题测试，并执行 `npm run build` 验证 Provider 类型与生产构建。

#### 任务 2：订单页交互迁移

**文件：**

- 修改 `src/composables/useCrudList.ts`
- 新建 `src/composables/useCrudList.test.ts`
- 重写 `src/views/orders/OrdersView.vue`
- 新建 `src/views/orders/OrdersView.test.ts`
- 修改 `src/styles/business.css`

- [x] 编写组合函数失败测试，传入 `notify(message)` 后执行刷新和删除，断言通知回调收到真实操作结果且列表状态同步更新。
- [x] 编写订单页失败测试，验证搜索输入、状态选择、创建按钮和 Naive UI 表格均可访问。
- [x] 运行两个定向测试，确认可选通知接口和新订单页尚不存在导致失败。
- [x] 为 `UseCrudListOptions` 增加可选通知接口，未传入时继续使用原 Pinia Toast：

```ts
interface UseCrudListOptions<T extends RowRecord> {
  meta: ModuleMeta
  source: T[]
  filenamePrefix: string
  notify?: (message: string) => void
}

const notify = options.notify ?? toast.notify
```

- [x] 在订单页使用 `NInput`、`NSelect`、`NButton`、`NDataTable`、`NPagination`、`NModal`、`NForm` 与 `useMessage`，并继续通过现有组合函数暴露以下交互：

```ts
const list = useCrudList({
  meta: orderMeta,
  source: orderRows,
  filenamePrefix: '订单管理',
  notify: (message) => naiveMessage.info(message),
})
```
- [x] 表格列使用固定宽度和 `scroll-x`，状态单元格继续渲染现有 `StatusTag`，操作列保持固定在右侧。
- [x] 运行定向测试，确认新订单页和组合函数测试通过。

#### 任务 3：页面滚动边界

**文件：**

- 修改 `tests/layout.test.ts`
- 修改 `src/styles/business.css`

- [x] 扩展布局失败测试，应用真实样式后断言 `main`、`.business-page` 与订单表格宿主允许收缩，表格滚动容器使用局部横向滚动：

```ts
expect(getComputedStyle(main).minWidth).toBe('0px')
expect(getComputedStyle(tableHost).overflowX).toBe('auto')
```

- [x] 运行 `npm run test -- tests/layout.test.ts --reporter=verbose`，确认缺失的内容区宽度约束导致失败。
- [x] 增加以下宽度与滚动边界，不使用 document 级 `overflow-x: hidden` 掩盖溢出：

```css
main,
.business-page,
.order-table-host {
  min-width: 0;
}

.order-table-host {
  max-width: 100%;
  overflow-x: auto;
}
```
- [x] 再次运行布局测试，确认计算样式满足收缩与局部滚动契约。

#### 任务 4：文档与完整验证

**文件：**

- 修改 `README.md`
- 修改 `ITERATIONS.md`

- [x] 更新 README 的技术栈、依赖、项目结构、订单交互、数据边界和变更记录。
- [x] 将本迭代状态改为“第一阶段已完成”，填写实际变更、验证结果、已知限制和下一阶段迁移条件。
- [x] 运行 `npm run test -- --reporter=dot`、`npm run lint`、`npm run build` 和 `git diff --check`。
- [x] 启动开发服务器并执行浏览器检查；订单页受真实登录守卫阻止，已按实际情况记录受限项。

### 实际变更与验证结果

#### 实际变更

- 新增 Naive UI 依赖，在根组件接入中文语言、日期语言、深浅主题、对话框和消息上下文，并建立 Mystikos 紫色主题覆盖。
- 订单管理页改用 Naive UI 的输入、选择、按钮、数据表格、分页、弹窗、表单、删除确认和消息组件；统计卡片、状态标签与 Lucide 图标继续复用现有实现。
- `useCrudList` 增加可选通知回调，订单页使用 Naive UI 消息，未迁移页面继续使用原 Pinia Toast。
- 主内容、业务页面、订单面板与表格宿主增加可收缩宽度约束，固定宽度列通过订单表格内部滚动展示。
- 新增根级主题、订单关键词筛选与创建弹窗、通知边界和局部滚动回归测试。

#### 验证结果

- `npm run test -- --reporter=dot`：14 个测试文件、29 项测试全部通过。
- `npm run lint`：通过。
- `npm run build`：通过，TypeScript 类型检查及 Vite 生产构建完成。
- `git diff --check`：通过。
- 开发服务器可正常启动；浏览器访问 `/orders` 时按真实路由守卫跳转到 `/login?redirect=/orders`，登录页控制台无错误或警告，页面 `scrollWidth` 与 `clientWidth` 均为 1280。

#### 已知限制

- 当前浏览器会话没有管理员登录态，因此未在真实路由页面中完成订单表格 hover、弹窗和深浅主题的人工视觉检查；对应组件交互与滚动边界已由 Vitest 覆盖，不能替代后续带登录态的稳定观察。
- 订单数据仍为本地 Mock，分页、新增、编辑和删除均不持久化，也未接入服务端状态流转。
- Naive UI 目前只用于根级 Provider 和订单页，其他模块暂时保留原组件，避免一次性迁移扩大回归范围。
- 安装依赖时 npm audit 报告 1 个高危依赖项，本迭代未自动修改依赖树，需要另行评估处理。

### 后续计划

先观察订单页在真实登录态、不同视口和深浅主题下的滚动与交互稳定性。稳定后，再结合组件复用度和包体积评估抽取项目级封装，并按用户管理、陪玩师管理、身份申请审核、其余本地 Mock 模块的顺序分批迁移。
