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
        <div class="cell">
          <div class="cell-bd">
            {{ deviceDesc.salesNetworkName }}
          </div>
          <div class="cell-ft">
            {{ deviceDesc.createTime | dateFormat }}
          </div>
        </div>
        <div class="media">
          <p>设备编号：{{ deviceDesc.terminalID }}</p>
          <p>机器型号：{{ deviceDesc.printerModel }}</p>
          <p class="red">{{ deviceDesc.printerStatusDesc }} {{ deviceDesc.terminalStatus == 601 ? '终端失联' : '' }}</p>
          <span v-if="type == 401" class="red fault-status">待处理</span>
          <span v-if="type == 402" class="green fault-status">已处理</span>
          <span v-if="type == 403" class="origin fault-status">求助</span>
        </div>
        <div class="cell">
          <div class="cell-bd">
            {{ deviceDesc.detailAddress }} 
          </div>
          <div class="cell-ft scoped-to" @click.stop="onOpenLocation(deviceDesc)">
            <img src="../assets/nav.png" width="20px" height="20px" alt="">
          </div>
        </div>
      </div>
      <div class="cells">
        <div class="cell" :class="{'cell_access': type != '402'}" @click="onNetworkTypeModalShow">
          <div class="cell-hd">
            网络设备：
          </div>
          <div class="cell-bd">
            <template v-if="info.networkType ">
              {{ info.networkType | idToName(networkTypeList)}}
              {{ info.networkType == 101 ? ':' + info.wifiNo : '' }}
            </template>
            <template v-else>
              <span class="gray">请选择网络设备</span>
            </template>
          </div>
          <span class="cell-ft"></span>
        </div>
        <div class="cell" :class="{'cell_access': type != '402'}" @click="onSignalLevelModalShow()">
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
        <div class="cell" :class="{'cell_access': type != '402'}" @click="onNav('category')">
          <div class="cell-hd">
            故障描述：
          </div>
          <div class="cell-bd">
            <template v-if="info.faultCategoryIDs ">
              {{ faultCategoryName }}
            </template>
            <template v-else>
              <span class="gray">请选择故障描述</span>
            </template>
          </div>
          <span class="cell-ft"></span>
        </div>
        <div class="cell">
          <template v-if="type == 402">
            {{ info.maintianRecord ? info.maintianRecord : '维修记录' }}
          </template>
          <template v-else>  
            <textarea v-model="info.maintianRecord" placeholder="请输入维修记录"  class="cell-bd" cols="30" rows="6" style="border:0;"></textarea>
          </template>
          
        </div>
      </div>
      <div class="panel">
        <div class="panel-hd">上传故障设备照片</div>
        <div class="panel-bd">
          <div class="upload-container column-center" @click="onUpload('printerPhoto')">
            <template v-if="info.printerPhoto && img.printerPhoto">    
              <img class="upload_img" :src="img.printerPhoto" alt="">
            </template>
            <template v-else>
              <span>+</span>
              <p>请上传打印机身码照片</p>
            </template>
          </div>
          <div class="upload-container column-center" @click="onUpload('devicePhoto')">
            <template v-if="info.devicePhoto && img.devicePhoto">    
              <img class="upload_img" :src="img.devicePhoto" alt="">
            </template>
            <template v-else>
              <span>+</span>
              <p>请上传设备外观图照片</p>
            </template>
          </div>
          <div class="upload-container column-center" @click="onUpload('testPhoto')">
            <template v-if="info.testPhoto && img.testPhoto">    
              <img class="upload_img" :src="img.testPhoto" alt="">
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
          <template v-if="type == 402">
            {{ info.num }}
          </template>
          <template v-else>  
            <input class="cell-bd" type="text" placeholder="请输入超表数" v-model="info.num"  style="border:0;">
          </template>
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
  import { fetchFaultDetail, fetchFaultDeviceDesc, saveFault, fetchfaultCategory } from '../api'
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
          printerPhoto: '', //	打印机图片 media_id	string	
          devicePhoto: '',	//设备图片 media_id	string	
          testPhoto: '', //	测试成功图片 media_id	string	
        },
        img: {
          printerPhoto: '',
          devicePhoto: '',	
          testPhoto: '',
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
        ],
        categoryList: []
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
      const self = this
      fetchFaultDeviceDesc({id, handID})
        .then(res => {
          if (res.body.status !== 'success') throw new Error()
          this.deviceDesc = res.body.data
          this.info.handID = res.body.data.handID

          this.status = 'success'
          if (this.type != '401') {
            fetchFaultDetail({type:this.type, id: this.info.handID})
              .then(res=> {
                if (res.body.status !== 'success') throw new Error()
                Object.assign(this.info, res.body.data)
                this.downImg()
                this.restore()
                if (this.info.faultCategoryIDs && !this.faultCategoryName) {
                  this.getCategoryName(this.info.faultCategoryIDs)
                }
                this.status = 'success'
              })
          } else {
            this.restore()
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
        printerPhoto: '', //	打印机图片 media_id	string	
        devicePhoto: '',	//设备图片 media_id	string	
        testPhoto: '', //	测试成功图片 media_id	string	
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

        if (params.networkType == '101' && !params.wifiNo ){
          this.$toast({
            message: '请填写wifi编码',
            duration: 3000
          });
          return 
        }
        if (!params.networkType ){
          this.$toast({
            message: '请选择网络类型',
            duration: 3000
          });
          return 
        }
        if (!params.signalLevel ){
          this.$toast({
            message: '请选择网络信号',
            duration: 3000
          });
          return 
        }
        if (!params.faultCategoryIDs ){
          this.$toast({
            message: '请选择故障类型',
            duration: 3000
          });
          return 
        }

        if (!params.printerPhoto || !params.devicePhoto || !params.testPhoto ){
          this.$toast({
            message: '请上传图片',
            duration: 3000
          });
          return 
        }

        saveFault(params)
          .then(res => {
            if (res.body.status !== 'success') throw new Error()
            this.$messagebox.alert('操作成功').then(action => {
              console.log(action)
               this.$router.go(-1)
            })
          })
          .catch(err => {
            this.$messagebox.alert('提交失败，请重试')
          })
      },

      onNetworkTypeModalShow() {
        if (this.type === '402') return false;
        this.networkTypeModal = true
      },
      onNetworkType() {
        this.networkTypeModal = false
      },
      onNetworkTypeChange(val){
        this.info.networkType = val
      },

      onSignalLevelModalShow() {
        if (this.type === '402') return false;
        this.signalLevelModal = true
      },
      onSignalLevel() {
        if (this.type === '402') return false;
        this.signalLevelModal = false
      },
      onSignalLevelChange(val){
        this.info.signalLevel = val
      },

      onNav() {
        if (this.type === '402') return false;
        this.cacheStore()
        this.$router.push({
          name: 'category',
          query: {
            ids: this.info.faultCategoryIDs
          }
        })
      },
      onUpload(name) {
        if (this.type === '402') return false;
        const self = this
        this.wxSDK.then(wx => {
          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
              var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
              if (localIds[0]) {
                const loading = self.$toast({
                  message: '上传图片中...',
                  duration: -1
                });
                wx.uploadImage({
                  localId: localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
                  isShowProgressTips: 1, // 默认为1，显示进度提示
                  success: function (res1) {
                    self.info[name] = res1.serverId
                    self.img[name] = localIds[0]
                    loading.close()
                  }
                })
              }
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
            scale: 20, // 地图缩放级别,整形值,范围从1~28。默认为最大
            infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
          });
        })
      },

      getCategoryName(vals) {
        try {
          fetchfaultCategory()
            .then(res => {
              const a = res.body.data
              const listTemp = []
              a.forEach((item, i) => {
                item.childList.forEach(aa => {
                  listTemp.push({
                    value: aa.categoryId,
                    label: aa.categoryName
                  })
                })
              })
              this.categoryList = listTemp
            
              if (typeof vals === 'string') {
                vals = vals.split(',')
              }
              const nameList = []
              vals.forEach(id => {
                this.categoryList.forEach(item => {
                  if (id == item.value) {
                    nameList.push(item.label)
                  }
                })
              })
              this.faultCategoryName = nameList.join(',')
          })
        } catch(e) {}
      },
      downImg () {
        const self = this

        this.wxSDK.then(wx => {
          this.info.printerPhoto && wx.downloadImage({
            serverId: this.info.printerPhoto, // 需要下载的图片的服务器端ID，由uploadImage接口获得
            success: function (res) {
              
              self.img.printerPhoto = res.localId // 返回图片下载后的本地ID
            }
          })
          this.info.devicePhoto && wx.downloadImage({
            serverId: this.info.devicePhoto, // 需要下载的图片的服务器端ID，由uploadImage接口获得
            success: function (res) {
              self.img.devicePhoto = res.localId // 返回图片下载后的本地ID
            }
          })
          this.info.testPhoto && wx.downloadImage({
            serverId: this.info.testPhoto, // 需要下载的图片的服务器端ID，由uploadImage接口获得
            success: function (res) {
              self.img.testPhoto = res.localId // 返回图片下载后的本地ID
            }
          })
        })
      },
      cacheStore() {
        sessionStorage.fault_info = JSON.stringify(this.info)
        sessionStorage.fault_img = JSON.stringify(this.img)
      },
      restore () {
        const info = sessionStorage.fault_info
        const img = sessionStorage.fault_img
        sessionStorage.removeItem('fault_info')
        sessionStorage.removeItem('fault_img')
        if (info) {
          try {
            Object.assign(this.info, JSON.parse(info))
          } catch (e) {
            console.log(32323242)
          }
        }
        if (img) {
          try {
            Object.assign(this.img, JSON.parse(img))
          } catch (e) {}
        }
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


