<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Ban, KeyRound, Plus, RefreshCcw, ShieldCheck, Trash2, UsersRound, X } from 'lucide-vue-next'
import StatusTag from '../../components/StatusTag.vue'
import { addUserRole, banUser, createUser, deleteUser, fetchUserPermissions, fetchUsers, removeUserRole } from '../../api/users'
import { useToastStore } from '../../stores/toast'
import type { CreateUserRequest, UserProfile, UserRole, UserStatus } from '../../types'

const toast = useToastStore()
const rows = ref<UserProfile[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<'' | UserStatus>('')
const pageNum = ref(1)
const pageSize = 20
const total = ref(0)
const pages = ref(0)
const createOpen = ref(false)
const rolesOpen = ref(false)
const permissionsOpen = ref(false)
const selected = ref<UserProfile | null>(null)
const permissions = ref<string[]>([])
const roleToAdd = ref<UserRole>('MEMBER')
let searchTimer: ReturnType<typeof setTimeout> | undefined

const roleOptions: UserRole[] = ['GUEST', 'MEMBER', 'COMPANION', 'CUSTOMER_SERVICE', 'ASSESSOR', 'ADMIN']
const statusLabels: Record<UserStatus, string> = { ACTIVE: '正常', DISABLED: '已停用', BANNED: '已封禁', DELETED: '已删除' }
const roleLabels: Record<UserRole, string> = { GUEST: '访客', MEMBER: '会员', COMPANION: '陪玩师', CUSTOMER_SERVICE: '客服', ASSESSOR: '考核员', ADMIN: '管理员' }
const form = reactive<CreateUserRequest>({ phone: '', email: '', password: '', nickname: '', initialRole: 'MEMBER' })
const rangeStart = computed(() => (total.value ? (pageNum.value - 1) * pageSize + 1 : 0))
const rangeEnd = computed(() => Math.min(pageNum.value * pageSize, total.value))

async function loadUsers() {
  loading.value = true
  try {
    const result = await fetchUsers({ pageNum: pageNum.value, pageSize, keyword: keyword.value.trim() || undefined, status: status.value || undefined })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '用户列表加载失败')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, { phone: '', email: '', password: '', nickname: '', initialRole: 'MEMBER' })
}

async function submitCreate() {
  if (!form.phone?.trim() && !form.email?.trim()) return toast.notify('手机号和邮箱至少填写一项')
  try {
    await createUser({ ...form })
    createOpen.value = false
    resetForm()
    toast.notify('用户创建成功')
    pageNum.value = 1
    await loadUsers()
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '用户创建失败')
  }
}

async function handleDelete(user: UserProfile) {
  if (!window.confirm(`确认删除用户“${user.nickname || user.userId}”吗？`)) return
  try { await deleteUser(user.userId); toast.notify('用户已删除'); await loadUsers() } catch (error) { toast.notify(error instanceof Error ? error.message : '删除失败') }
}

async function handleBan(user: UserProfile) {
  if (!window.confirm(`确认封禁用户“${user.nickname || user.userId}”吗？`)) return
  try { await banUser(user.userId); toast.notify('用户已封禁'); await loadUsers() } catch (error) { toast.notify(error instanceof Error ? error.message : '封禁失败') }
}

function openRoles(user: UserProfile) { selected.value = user; rolesOpen.value = true }

async function addRole() {
  if (!selected.value || selected.value.roles.includes(roleToAdd.value)) return
  try { await addUserRole(selected.value.userId, roleToAdd.value); toast.notify('角色已分配'); rolesOpen.value = false; await loadUsers() } catch (error) { toast.notify(error instanceof Error ? error.message : '角色分配失败') }
}

async function removeRole(role: UserRole) {
  if (!selected.value) return
  try { await removeUserRole(selected.value.userId, role); toast.notify('角色已移除'); rolesOpen.value = false; await loadUsers() } catch (error) { toast.notify(error instanceof Error ? error.message : '角色移除失败') }
}

async function showPermissions(user: UserProfile) {
  selected.value = user
  try { permissions.value = await fetchUserPermissions(user.userId); permissionsOpen.value = true } catch (error) { toast.notify(error instanceof Error ? error.message : '权限加载失败') }
}

watch(keyword, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { pageNum.value = 1; void loadUsers() }, 350) })
watch(status, () => { pageNum.value = 1; void loadUsers() })
onMounted(loadUsers)
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <div class="business-page user-page">
    <section class="business-title">
      <div><p>USER MANAGEMENT</p><h1>用户管理</h1><span>管理系统用户、账号状态、角色与权限</span></div>
      <div><button type="button" class="outline-action" :disabled="loading" @click="loadUsers"><RefreshCcw :size="16" />刷新</button><button type="button" class="primary" @click="createOpen = true"><Plus :size="17" />新增用户</button></div>
    </section>

    <section class="business-stats user-summary">
      <article><i class="tone-0"><UsersRound /></i><div><p>用户总数</p><strong>{{ total }}</strong><small>来自服务器实时数据</small></div></article>
      <article><i class="tone-1"><ShieldCheck /></i><div><p>当前页正常用户</p><strong>{{ rows.filter(item => item.status === 'ACTIVE').length }}</strong><small>当前第 {{ pageNum }} 页</small></div></article>
    </section>

    <section class="business-table panel">
      <div class="business-table-head"><div><h2>用户列表</h2><p>共 {{ total }} 个系统用户</p></div><div class="business-filters"><label><input v-model="keyword" placeholder="搜索昵称、手机号或邮箱" /></label><select v-model="status" aria-label="账号状态"><option value="">全部状态</option><option value="ACTIVE">正常</option><option value="DISABLED">已停用</option><option value="BANNED">已封禁</option><option value="DELETED">已删除</option></select></div></div>
      <div class="business-table-wrap"><table><thead><tr><th>用户ID</th><th>用户</th><th>联系方式</th><th>角色</th><th>会员等级</th><th>状态</th><th>操作</th></tr></thead><tbody>
        <tr v-if="loading"><td colspan="7" class="empty">正在加载用户数据...</td></tr>
        <tr v-for="user in rows" v-else :key="user.userId"><td class="identifier">#{{ user.userId }}</td><td class="strong">{{ user.nickname || '未设置昵称' }}</td><td><span>{{ user.phone || '-' }}</span><small class="cell-sub">{{ user.email || '-' }}</small></td><td><div class="role-list"><span v-for="role in user.roles" :key="role">{{ roleLabels[role] }}</span></div></td><td>{{ user.membershipTierCode || user.membershipTierLevel || '-' }}</td><td><StatusTag :status="statusLabels[user.status]" variant="business" /></td><td><div class="row-actions"><button type="button" title="角色管理" @click="openRoles(user)"><ShieldCheck :size="15" /></button><button type="button" title="查看权限" @click="showPermissions(user)"><KeyRound :size="15" /></button><button type="button" title="封禁" @click="handleBan(user)"><Ban :size="15" /></button><button type="button" title="删除" class="danger-action" @click="handleDelete(user)"><Trash2 :size="15" /></button></div></td></tr>
        <tr v-if="!loading && !rows.length"><td colspan="7" class="empty">没有找到符合条件的用户</td></tr>
      </tbody></table></div>
      <div class="pagination"><span>显示 {{ rangeStart }} - {{ rangeEnd }} 条，共 {{ total }} 条</span><div><button type="button" :disabled="pageNum <= 1 || loading" @click="pageNum--; loadUsers()">‹</button><button type="button" class="current">{{ pageNum }}</button><button type="button" :disabled="pageNum >= pages || loading" @click="pageNum++; loadUsers()">›</button></div></div>
    </section>

    <div v-if="createOpen" class="modal-backdrop" @click.self="createOpen = false"><form class="modal" @submit.prevent="submitCreate"><div class="modal-head"><div><h2>新增用户</h2><p>手机号与邮箱至少填写一项</p></div><button type="button" class="icon-btn" @click="createOpen = false"><X :size="19" /></button></div><div class="business-form dynamic-form"><label><span>昵称</span><input v-model="form.nickname" placeholder="请输入昵称" /></label><label><span>手机号</span><input v-model="form.phone" type="tel" placeholder="请输入手机号" /></label><label><span>邮箱</span><input v-model="form.email" type="email" placeholder="请输入邮箱" /></label><label><span>初始密码</span><input v-model="form.password" type="password" autocomplete="new-password" placeholder="留空则仅支持验证码登录" /></label><label><span>初始角色</span><select v-model="form.initialRole"><option v-for="role in roleOptions" :key="role" :value="role">{{ roleLabels[role] }}</option></select></label></div><div class="modal-foot"><button type="button" class="secondary" @click="createOpen = false">取消</button><button type="submit" class="primary">确认创建</button></div></form></div>

    <div v-if="rolesOpen && selected" class="modal-backdrop" @click.self="rolesOpen = false"><div class="modal compact-modal"><div class="modal-head"><div><h2>角色管理</h2><p>{{ selected.nickname || `用户 #${selected.userId}` }}</p></div><button type="button" class="icon-btn" @click="rolesOpen = false"><X :size="19" /></button></div><div class="business-form"><div class="assigned-roles"><button v-for="role in selected.roles" :key="role" type="button" @click="removeRole(role)">{{ roleLabels[role] }} ×</button></div><label><span>新增角色</span><select v-model="roleToAdd"><option v-for="role in roleOptions" :key="role" :value="role">{{ roleLabels[role] }}</option></select></label></div><div class="modal-foot"><button type="button" class="secondary" @click="rolesOpen = false">关闭</button><button type="button" class="primary" @click="addRole">分配角色</button></div></div></div>

    <div v-if="permissionsOpen && selected" class="modal-backdrop" @click.self="permissionsOpen = false"><div class="modal compact-modal"><div class="modal-head"><div><h2>权限列表</h2><p>{{ selected.nickname || `用户 #${selected.userId}` }}</p></div><button type="button" class="icon-btn" @click="permissionsOpen = false"><X :size="19" /></button></div><div class="permission-list"><code v-for="item in permissions" :key="item">{{ item }}</code><p v-if="!permissions.length">当前没有已解析权限</p></div><div class="modal-foot"><button type="button" class="primary" @click="permissionsOpen = false">知道了</button></div></div></div>
  </div>
</template>
