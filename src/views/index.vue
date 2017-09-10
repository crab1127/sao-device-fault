<template>
  <div id="app">
    <mt-navbar v-model="selected" style="border-bottom: 2px solid #ddd;">
      <mt-tab-item id="301">待处理</mt-tab-item>
      <mt-tab-item id="302">已处理</mt-tab-item>
      <mt-tab-item id="303">求助</mt-tab-item>
    </mt-navbar>
    <mt-tab-container v-model="selected">
      <mt-tab-container-item id="301">
        <div class="panel" v-for="item in list301" :key="item.terminalID" @click="onNav(item.terminalID, item.handID, 401)">
          <div class="cell gray">
            <div class="cell-bd">
              {{ item.salesNetworkName }}
            </div>
            <div class="cell-ft">
              {{ item.createTime | dateFormat }}
            </div>
          </div>
          <div class="media">
            <p>设备编号：{{ item.salesNetworkID }}</p>
            <p>机器型号：{{ item.printerModel }}</p>
            <p class="red">{{ item.printerStatusDesc }}</p>
            <span class="red fault-status">待处理</span>
          </div>
          <div class="cell gray">
            <div class="cell-bd">
              {{ item.detailAddress }}
            </div>
            <div class="cell-ft scoped-to" @click.stop="onOpenLocation(item)">
              <img src="../assets/nav.png" width="20px" height="20px" alt="">
            </div>
          </div>
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="302">
        <template v-if="list302 && list302.length">
          <div class="panel" v-for="item in list302" :key="item.terminalID" @click="onNav(item.terminalID, item.handID, 402)">
            <div class="cell gray">
              <div class="cell-bd">
                {{ item.salesNetworkName }}
              </div>
              <div class="cell-ft">
                {{ item.createTime | dateFormat }}
              </div>
            </div>
            <div class="media">
              <p>设备编号：{{ item.salesNetworkID }}</p>
              <p>机器型号：{{ item.printerModel }}</p>
              <p class="red">{{ item.printerStatusDesc }}</p>
              <span class="green fault-status">已处理</span>
            </div>
            <div class="cell gray">
              <div class="cell-bd">
                {{ item.detailAddress }}
              </div>
              <div class="cell-ft scoped-to" @click.stop="onOpenLocation(item)">
                <img src="../assets/nav.png" width="20px" height="20px" alt="">
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          没数据
        </template>
      </mt-tab-container-item>
      <mt-tab-container-item id="303">
        <template v-if="list303 && list303.length">
          <div class="panel" v-for="item in list303" :key="item.terminalID" @click="onNav(item.terminalID, item.handID, 403)">
            <div class="cell gray">
              <div class="cell-bd">
                {{ item.salesNetworkName }}
              </div>
              <div class="cell-ft">
                {{ item.createTime | dateFormat }}
              </div>
            </div>
            <div class="media">
              <p>设备编号：{{ item.salesNetworkID }}</p>
              <p>机器型号：{{ item.printerModel }}</p>
              <p class="red">{{ item.printerStatusDesc }}</p>
              <span class="origin fault-status">求助</span>
            </div>
            <div class="cell gray">
              <div class="cell-bd">
                {{ item.detailAddress }}
              </div>
              <div class="cell-ft scoped-to" @click.stop="onOpenLocation(item)">
                <img src="../assets/nav.png" width="20px" height="20px" alt="">
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          没数据
        </template>
      </mt-tab-container-item>
    </mt-tab-container>
  </div>
</template>

<script>
  import { fetchFaultList } from '../api'
  import { dateFormat } from '../common'
  import wxSDK from '../wx'

  export default {
    name: 'fault',
    data () {
      return {
        selected: '301',
        list301: [],
        list302: [],
        list303: []
      }
    },
    watch: {
      selected(val) {
        this.load(val)
      }
    },

    mounted () {
      this.wxSDK = wxSDK()
      this.load(this.selected)
    },
    methods: {
      load(type) {
        fetchFaultList({type})
          .then(res => {
            this['list' + type] = res.body.page.items
          })
      },
      onChange(e, a){
        console.log(e)
      },
      onNav(id, handID, type) {
        this.$router.push({
          name: 'detail',
          params: {id},
          query: {handID, type}
        })
      },
      onOpenLocation(data) {
        this.wxSDK.then(wx => {
          wx.openLocation({
            latitude: data.latitude, // 纬度，浮点数，范围为90 ~ -90
            longitude: data.longitude, // 经度，浮点数，范围为180 ~ -180。
            name: data.salesNetworkName, // 位置名
            address: data.detailAddress, // 地址详情说明
            scale: 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
            infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
          });
        })
      }
    },
    filters: {
      dateFormat
    }
  }
</script>

<style scoped>
#app{
  text-align: left;
}
  .media {
    background: #fff;
    padding: 10px;
    position: relative;
    line-height: 1.8;
    border-top:1px solid #ddd;
    border-bottom:1px solid #ddd;
  }
  .fault-status {
    position: absolute;
    top: 10px;
    right: 10px;
  }
</style>

