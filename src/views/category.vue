<template>
  <div>
    <template v-for="item in list">
      <div class="cells-title" :key="item.categoryId">
        {{ item.categoryName }}
      </div>
      <div class="cells" :key="item.categoryId">
        <mt-checklist
          align="right"
          v-model="value"
          :options="item.items">
        </mt-checklist>
      </div>
    </template>
    <div class="btn-container">
      <mt-button type="primary" @click="onSure">确定</mt-button>
    </div>
  </div>
</template>

<script>
  import { fetchfaultCategory } from '../api'
  export default {
    name: 'category',
    data () {
      return {
        value: [],
        list: [],
        listTemp: []
      }
    },
    watch: {
      value(vals) {
        const nameList = []
        vals.forEach(id => {
          this.listTemp.forEach(item => {
            if (id == item.value) {
              nameList.push(item.label)
            }
          })
        })
        this.$events.emit('CATEGORY_UPDATE', vals.join(','), nameList.join(','))
      }
    },
    mounted() {
      fetchfaultCategory()
        .then(res => {
          const a = res.body.data
          const listTemp = []
          a.forEach((item, i) => {
            a[i].items = []
            item.childList.forEach(aa => {
              // console.log(aa)
              a[i].items.push({
                value: aa.categoryId,
                label: aa.categoryName
              })
              listTemp.push({
                value: aa.categoryId,
                label: aa.categoryName
              })
            })
          })
          this.listTemp = listTemp
          this.list = a
        })
      const ids = this.$route.query.ids
      if (ids) {
        this.value = ids.split(',')
      }
    },
    methods: {
      onSure() {
        this.$router.go(-1)
      }
    }
  }
</script>

<style scoped>

</style>


