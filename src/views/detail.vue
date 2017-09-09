<template>
  <div>
    <template v-if="status === 'loading'">
      加载数据中。。。
    </template>
    <template v-if="status === 'error'">
      加载数据失败
    </template>
    <template v-if="status === 'success'">
      <div class="panel">
        <div class="cell gray">
          <div class="cell-bd">
            {{ deviceDesc.salesNetworkName }}
          </div>
          <div class="cell-ft">
            {{ deviceDesc.createTime | dateFormat }}
          </div>
        </div>
        <div class="media">
          <p>设备编号：{{ deviceDesc.salesNetworkID }}</p>
          <p>机器型号：{{ deviceDesc.printerModel }}</p>
          <p class="red">{{ deviceDesc.printerStatusDesc }}</p>
          <span v-if="type == 401" class="red fault-status">待处理</span>
          <span v-if="type == 402" class="green fault-status">已处理</span>
          <span v-if="type == 403" class="origin fault-status">求助</span>
        </div>
        <div class="cell gray">
          <div class="cell-bd">
            {{ deviceDesc.detailAddress }}
          </div>
          <div class="cell-ft scoped-to" @click.stop="onOpenLocation(deviceDesc)">
            <img src="../assets/nav.png" width="20px" height="20px" alt="">
          </div>
        </div>
      </div>
      <div class="cells">
        <div class="cell cell_access" @click="networkTypeModal = true">
          <div class="cell-hd">
            网络设备：
          </div>
          <div class="cell-bd">
            <template v-if="info.networkType ">
              {{ info.networkType | idToName(networkTypeList)}}
            </template>
            <template v-else>
              <span class="gray">请选择网络设备</span>
            </template>
          </div>
          <span class="cell-ft"></span>
        </div>
        <div class="cell cell_access" @click="signalLevelModal = true">
          <div class="cell-hd">
            网络信号：
          </div>
          <div class="cell-bd">
            <template v-if="info.signalLevel ">
              {{ info.signalLevel | idToName(signalLevelList) }}
            </template>
            <template v-else>
              <span class="gray">请选择网络信号</span>
            </template>
          </div>
          <span class="cell-ft"></span>
        </div>
      </div>

      <div class="cells">
        <div class="cell cell_access" @click="onNav('category')">
          <div class="cell-hd">
            故障描述：
          </div>
          <div class="cell-bd">
            {{ info.faultCategoryIDs ? faultCategoryName : '请选择故障描述' }}
            
          </div>
          <span class="cell-ft"></span>
        </div>
        <div class="cell">
          <textarea v-model="info.maintianRecord" placeholder="请输入维修记录"  class="cell-bd" cols="30" rows="6" style="border:0;">

          </textarea>
        </div>
      </div>
      <div class="panel">
        <div class="panel-hd">上传故障设备照片</div>
        <div class="panel-bd">
          <div class="upload-container column-center" @click="onUpload('printerPhoto')">
            <template v-if="info.printerPhoto">    
              <img class="upload_img" :src="info.printerPhoto" alt="">
            </template>
            <template v-else>
              <span>+</span>
              <p>请上传打印机身码照片</p>
            </template>
          </div>
          <div class="upload-container column-center" @click="onUpload('devicePhoto')">
            <template v-if="info.devicePhoto">    
              <img class="upload_img" :src="info.devicePhoto" alt="">
            </template>
            <template v-else>
              <span>+</span>
              <p>请上传设备外观图照片</p>
            </template>
          </div>
          <div class="upload-container column-center" @click="onUpload('testPhoto')">
            <template v-if="info.testPhoto">    
              <img class="upload_img" :src="info.testPhoto" alt="">
            </template>
            <template v-else>
              <span>+</span>
              <p>请上传测试页照片</p>
            </template>
          </div>
        </div>
      </div>  

      <div class="cells">
        <div class="cell cell_access">
          <div class="cell-hd">
            超表数：
          </div>
          <input class="cell-bd" type="text" placeholder="请输入超表数" v-model="info.num"  style="border:0;">
        </div>
      </div>
      <div class="btn-container">
        <template v-if="type == 401">  
          <mt-button type="danger" @click="onSubmit(403)">求助</mt-button>
          <mt-button type="primary" @click="onSubmit(402)">上报处理</mt-button>
        </template>
        <template v-if="type == 403">  
          <mt-button type="primary" @click="onSubmit(402)">上报处理</mt-button>
        </template>
      </div>
    </template>

    <modal v-if="networkTypeModal" @close="networkTypeModal = false" @sure="onNetworkType">
      <div slot="body">
        <div class="flex">
          <template v-for="item in networkTypeList" >
            <mt-button class="flex-item" 
              :type="info.networkType == item.value ? 'primary' : 'default'" 
              @click="onNetworkTypeChange(item.value)" 
              :key="item.value">
              {{ item.label }}
            </mt-button>
          </template>  
        </div>
        <div class="flex" v-if="info.networkType == 101">
          <input class="flex-item text-center" style="padding:10px;" placeholder="请输入wifi编码" type="text" v-model="info.wifiNo">
        </div>
      </div>
    </modal>

    <modal v-if="signalLevelModal" @close="signalLevelModal = false" @sure="onSignalLevel">
      <div slot="body" class="flex">
         <template v-for="item in signalLevelList">
          <mt-button class="flex-item" 
            :type="info.signalLevel == item.value ? 'primary' : 'default'" 
            @click="onSignalLevelChange(item.value)" 
            :key="item.value">
            {{ item.label }}
          </mt-button>
        </template>  
      </div>
    </modal>
  </div>
</template>

<script>
  import modal from '../components/modal'
  import { fetchFaultDetail, fetchFaultDeviceDesc, saveFault } from '../api'
  import { dateFormat } from '../common'
  import wxSDK from '../wx'

  export default {
    name: 'detail',
    data () {
      return {
        status: 'loading',
        deviceDesc: {},
        id: null,
        type: null,
        networkTypeModal: false,
        signalLevelModal: false,
        faultCategoryName: '',
        info : {
          handID: null, //	任务ID	number	
          recordStatus: null, //	处理状态:402已处理, 403:求助	number	
          faultCategoryIDs: null, //	故障描述ID,多个以逗号分割	string	
          maintianRecord: null, //	维修记录	string	
          signalLevel: null, //	201:信号良好,202:信号差	number	
          networkType: null, //	网络类型: 101:WIFI蛋,102:中继器, 103:网线	number	@mock=101
          wifiNo:null, //	wifi编号
          num: null, //	超表数	string	
          printerPhoto: 'http://img1.gamersky.com/image2017/09/20170906_ls_141_2/gamersky_006small_012_2017961814FF9.jpg', //	打印机图片 media_id	string	
          devicePhoto: 'http://img1.gamersky.com/image2017/09/20170906_ls_141_2/gamersky_006small_012_2017961814FF9.jpg',	//设备图片 media_id	string	
          testPhoto: 'http://img1.gamersky.com/image2017/09/20170906_ls_141_2/gamersky_006small_012_2017961814FF9.jpg', //	测试成功图片 media_id	string	
        },
        networkTypeList: [
          {
            value: 101,
            label: 'WIFI蛋'
          },
          {
            value: 102,
            label: '中继器'
          },
          {
            value: 103,
            label: '网线'
          }
        ],
        signalLevelList: [
          {
            value: 201,
            label: '信号良好'
          },
          {
            value: 202,
            label: '信号差'
          }
        ]
      }
    },
    mounted() {
      this.wxSDK = wxSDK()
      this.$events.on('CATEGORY_UPDATE', (ids, name) => {
        this.info.faultCategoryIDs = ids
        this.faultCategoryName = name
      })
    },
    activated() {
      const id = this.id = this.$route.params.id
      const handID = this.$route.query.handID
      this.type = this.$route.query.type
      fetchFaultDeviceDesc({id, handID})
        .then(res => {
          if (res.body.status !== 'success') throw new Error()
          this.deviceDesc = res.body.data
          this.info.handID = res.body.data.handID

          this.status = 'success'
          if (this.type) {
            fetchFaultDetail({type:this.type, id: this.info.handID})
             .then(res=> {
                if (res.body.status !== 'success') throw new Error()
                Object.assign(this.info, res.body.data)
                this.status = 'success'
              })
          } 
        })
        .catch(err => {
          console.log(err)
          this.status = 'error'
        })
    },
    deactivated() {
      this.info = {
        handID: null, //	任务ID	number	
        recordStatus: null, //	处理状态:402已处理, 403:求助	number	
        faultCategoryIDs: null, //	故障描述ID,多个以逗号分割	string	
        maintianRecord: null, //	维修记录	string	
        signalLevel: null, //	201:信号良好,202:信号差	number	
        networkType: null, //	网络类型: 101:WIFI蛋,102:中继器, 103:网线	number	@mock=101
        wifiNo:null, //	wifi编号
        num: null, //	超表数	string	
        printerPhoto: 'http://img1.gamersky.com/image2017/09/20170906_ls_141_2/gamersky_006small_012_2017961814FF9.jpg', //	打印机图片 media_id	string	
        devicePhoto: 'http://img1.gamersky.com/image2017/09/20170906_ls_141_2/gamersky_006small_012_2017961814FF9.jpg',	//设备图片 media_id	string	
        testPhoto: 'http://img1.gamersky.com/image2017/09/20170906_ls_141_2/gamersky_006small_012_2017961814FF9.jpg', //	测试成功图片 media_id	string	
      }
    },
    methods: {
      onSubmit(status) {
        const params = {}
        for (var key in this.info) {
          if (this.info.hasOwnProperty(key)) {
            if (this.info[key]) {
              params[key] = this.info[key]
            }
          }
        }
        params.recordStatus = status
        saveFault(params)
          .then(res => {
            if (res.body.status !== 'status') throw new Error()
            this.$messagebox.alert('操作成功').then(action => {
              console.log(action)
            })
          })
          .catch(err => {
            this.$messagebox.alert('提交失败，请重试')
          })
      },
      onNetworkType() {
        this.networkTypeModal = false
      },
      onNetworkTypeChange(val){
        this.info.networkType = val
      },
      onSignalLevel() {
        this.signalLevelModal = false
      },
      onSignalLevelChange(val){
        this.info.signalLevel = val
      },
      onNav() {
        this.$router.push({
          name: 'category',
          query: {
            ids: this.info.faultCategoryIDs
          }
        })
      },
      onUpload(name) {
        this.wxSDK.then(wx => {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
              var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
              console.log(res)
            }
          })
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
    components: {
      modal
    },
    filters: {
      dateFormat,
      idToName(id, data) {
        let name = ''
        data.forEach(item => {
          if (item.value == id) {
            name = item.label
          }
        })
        return name
      }
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
  .item {
    margin-bottom: 10px;
  }
  .upload-container{
    border:1px solid #ddd;
    height: 130px;
    margin: 20px;
    color: #999;
    overflow: hidden;
  }
  .upload_img{
    width: 100%;
  }
  .upload-container span {
    font-size: 30px;
  }
</style>


