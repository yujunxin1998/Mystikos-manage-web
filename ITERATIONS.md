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
