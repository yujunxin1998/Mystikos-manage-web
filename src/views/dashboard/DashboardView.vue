<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Gamepad2,
  Headphones,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
  X,
} from 'lucide-vue-next'
import StatCards from '../../components/StatCards.vue'
import StatusTag from '../../components/StatusTag.vue'
import { chartPaths, dashboardStats } from '../../mocks/dashboard'
import { dashboardOrders } from '../../mocks/orders'

const range = ref<'周' | '月'>('周')
const showOrder = ref(false)
const keyword = ref('')

const filtered = computed(() =>
  dashboardOrders.filter((order) =>
    Object.values(order).some((value) => value.includes(keyword.value)),
  ),
)

const chart = computed(() => chartPaths[range.value])

const statIcons = [CircleDollarSign, Gamepad2, UserRound, Headphones]
const statTones = ['violet', 'orange', 'blue', 'green']
</script>

<template>
  <div class="page">
    <section class="welcome">
      <div>
        <p class="eyebrow"><span></span> MONDAY · AUG 24</p>
        <h1>上午好，杨林 <span>👋</span></h1>
        <p>今天已有 <b>18</b> 笔新订单，预计营收较昨日提升 <b>12.6%</b>。</p>
      </div>
      <button type="button" class="primary" @click="showOrder = true">
        <Plus :size="18" /> 创建订单
      </button>
    </section>

    <StatCards
      :items="dashboardStats"
      :icons="statIcons"
      :tones="statTones"
      variant="dashboard"
    />

    <section class="content-grid">
      <article class="panel revenue">
        <div class="panel-head">
          <div>
            <h2>营收趋势</h2>
            <p>最近{{ range === '周' ? '7天' : '30天' }}业务收入变化</p>
          </div>
          <div class="switch">
            <button type="button" :class="{ active: range === '周' }" @click="range = '周'">
              近7天
            </button>
            <button type="button" :class="{ active: range === '月' }" @click="range = '月'">
              近30天
            </button>
          </div>
        </div>
        <div class="chart-total"><strong>¥ 68,420</strong><span>+14.6% 较上期</span></div>
        <div class="chart">
          <div class="y-axis"><span>20k</span><span>15k</span><span>10k</span><span>5k</span><span>0</span></div>
          <svg viewBox="0 0 540 170" preserveAspectRatio="none">
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#7c5cfc" stop-opacity=".28" />
                <stop offset="1" stop-color="#7c5cfc" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="chart + ' L540 170 L0 170Z'" fill="url(#fill)" />
            <path :d="chart" fill="none" stroke="#7c5cfc" stroke-width="3" stroke-linecap="round" />
          </svg>
          <div class="x-axis">
            <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>
          </div>
        </div>
      </article>

      <article class="panel overview">
        <div class="panel-head">
          <div>
            <h2>订单概览</h2>
            <p>今日订单状态分布</p>
          </div>
          <button type="button" class="text-btn">查看全部 <ChevronRight :size="15" /></button>
        </div>
        <div class="donut-wrap">
          <div class="donut">
            <div><strong>86</strong><small>总订单</small></div>
          </div>
          <ul>
            <li><i class="c1"></i><span>已完成</span><b>42</b><em>48.8%</em></li>
            <li><i class="c2"></i><span>进行中</span><b>28</b><em>32.6%</em></li>
            <li><i class="c3"></i><span>待接单</span><b>12</b><em>14.0%</em></li>
            <li><i class="c4"></i><span>已取消</span><b>4</b><em>4.6%</em></li>
          </ul>
        </div>
        <div class="completion">
          <span>今日完成率 <b>83.2%</b></span>
          <div><i></i></div>
        </div>
      </article>
    </section>

    <section class="panel orders">
      <div class="panel-head">
        <div>
          <h2>最新订单</h2>
          <p>实时查看最新业务订单</p>
        </div>
        <div class="table-actions">
          <label>
            <Search :size="16" />
            <input v-model="keyword" placeholder="搜索订单" />
          </label>
          <button type="button" class="filter"><Clock3 :size="16" /> 今日</button>
          <button type="button" class="text-btn">全部订单 <ChevronRight :size="15" /></button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>订单编号</th>
              <th>会员</th>
              <th>游戏 / 服务</th>
              <th>陪玩师</th>
              <th>金额</th>
              <th>状态</th>
              <th>下单时间</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filtered" :key="order.id">
              <td class="order-id">{{ order.id }}</td>
              <td>
                <div class="member">
                  <span>{{ order.user.slice(0, 1) }}</span>{{ order.user }}
                </div>
              </td>
              <td><b>{{ order.game }}</b><small>{{ order.service }}</small></td>
              <td>{{ order.worker }}</td>
              <td class="amount">{{ order.amount }}</td>
              <td><StatusTag :status="order.status" variant="table" /></td>
              <td>{{ order.time }}</td>
              <td><MoreHorizontal :size="18" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="showOrder" class="modal-backdrop" @click.self="showOrder = false">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h2>创建新订单</h2>
            <p>录入会员的陪玩服务需求</p>
          </div>
          <button type="button" class="icon-btn" @click="showOrder = false"><X :size="19" /></button>
        </div>
        <div class="form">
          <label><span>选择会员</span><input placeholder="输入昵称或手机号搜索" /></label>
          <label>
            <span>游戏项目</span>
            <select>
              <option>三角洲行动</option>
              <option>无畏契约</option>
            </select>
          </label>
          <div class="form-row">
            <label>
              <span>订单金额</span>
              <div class="input-prefix"><i>¥</i><input value="299.00" /></div>
            </label>
            <label>
              <span>支付方式</span>
              <select>
                <option>账户余额</option>
                <option>扫码支付</option>
              </select>
            </label>
          </div>
          <label><span>服务备注</span><textarea placeholder="填写段位、局数或其他需求"></textarea></label>
        </div>
        <div class="modal-foot">
          <button type="button" class="secondary" @click="showOrder = false">取消</button>
          <button type="button" class="primary" @click="showOrder = false">
            <CreditCard :size="17" /> 确认创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
