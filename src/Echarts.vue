<template>
  <div class="echarts"> 
    <visTitle v-bind:msg="post"></visTitle>
    <copyr></copyr>
    <!-- <div :style="{height:'800px',width:'100%'}" ref="myEchart"></div> -->
    <div id="map" ref="myEchart"></div>

  </div>
</template>
<script>
  import echarts from "echarts";
  import $ from "jquery"
  import visTitle from './components/Title.vue'
  import copyr from './components/CopyrightNote.vue'
 
  //   import '../../node_modules/echarts/map/js/world.js'
  import '../node_modules/echarts/map/js/china.js' // 引入中国地图数据

  export default {
    name: "echarts",
    components: {
      visTitle,
      copyr
    },
    props: ["userJson"],
    data() {
      return {
        //疫情数据文字播报
        post:{
          year:0,
          month:0,
          day:0,
          confirm:0,
          curconfirm:0,
          cure:0,
          death:0,
          suspect:0,
          name:'全国' 
        },
        chart: null
      };
    }, 
    mounted() {
      this.ncovMapConfigure();
    },
    beforeDestroy() {
      if (!this.chart) {
        return;
      }
      this.chart.dispose();
      this.chart = null;
    },
    methods: {
      ncovMapConfigure(){
        let compass=this;
        var myChart = echarts.init(this.$refs.myEchart);
        //34个省、市、自治区的名字拼音映射数组
        var provinces = {
            //23个省
            "台湾": "taiwan",
            "河北": "hebei",
            "山西": "shanxi",
            "辽宁": "liaoning",
            "吉林": "jilin",
            "黑龙江": "heilongjiang",
            "江苏": "jiangsu",
            "浙江": "zhejiang",
            "安徽": "anhui",
            "福建": "fujian",
            "江西": "jiangxi",
            "山东": "shandong",
            "河南": "henan",
            "湖北": "hubei",
            "湖南": "hunan",
            "广东": "guangdong",
            "海南": "hainan",
            "四川": "sichuan",
            "贵州": "guizhou",
            "云南": "yunnan",
            "陕西": "shanxi1",
            "甘肃": "gansu",
            "青海": "qinghai",
            //5个自治区
            "新疆": "xinjiang",
            "广西": "guangxi",
            "内蒙古": "neimenggu",
            "宁夏": "ningxia",
            "西藏": "xizang",
            //4个直辖市
            "北京": "beijing",
            "天津": "tianjin",
            "上海": "shanghai",
            "重庆": "chongqing",
            //2个特别行政区
            "香港": "xianggang",
            "澳门": "aomen"
        };
        //直辖市和特别行政区-只有二级地图，没有三级地图
        var mapdata = [];
        let chinaSickCount=[];
        var d;
        let curDateData;
        let curDate=new Date(),year=curDate.getFullYear(),month=curDate.getMonth()+1,day=curDate.getDate();
        let apiDateParm;
        let provinceDic={};//疫情数据与Echarts加载地图数据对应字典
        let cityDic=[];//疫情数据市一级对应字典
        month<10?month='0'+month:month;
        day<10?day='0'+day:day;
        apiDateParm=year+'-'+month+'-'+day;//字符串拼接完成
        this.post.year=year;
        this.post.month=month;
        this.post.day=day;
        //ReqNcovData 获取当天数据并缓存
       
        let ReqNcovData=function(){
            try {
                //设置为同步
                $.ajaxSettings.async = false;
                $.get("http://api.tianapi.com/txapi/ncovcity/index?key=94e33ede5541c9f590b048ecfe4131de",
                    function(data){
                        if(data.code==200)
                        {
                            localStorage.setItem(apiDateParm,JSON.stringify(data));
                            console.log(data);
                            alert("状态码：" + data.code + "\n消息：" + data.msg);
                            curDateData=data;
                        }
                        else{
                            alert(data.msg);
                        }     
                });
                // $.ajaxSettings.async = true;
            } catch (error) {
                alert("调用疫情数据API失败")
            }
        };
        if(!localStorage.getItem(apiDateParm))
        {
          ReqNcovData();
        }else{
          curDateData=JSON.parse(localStorage.getItem(apiDateParm));//将当天缓存在localstrorage中对象解析出来\
          console.log(curDateData);
        }
        for(let index in curDateData.newslist)
        {
          this.post.confirm+=curDateData.newslist[index].confirmedCount;
          this.post.curconfirm+=curDateData.newslist[index].currentConfirmedCount;
          this.post.death+=curDateData.newslist[index].deadCount;
          this.post.cure+=curDateData.newslist[index].curedCount;
          this.post.suspect+=curDateData.newslist[index].suspectedCount;
          provinceDic[curDateData.newslist[index].provinceShortName]=parseInt(index) ;
        }
        
        chinaSickCount[0]=this.post.confirm;
        chinaSickCount[1]=this.post.curconfirm;
        chinaSickCount[2]=this.post.cure;
        chinaSickCount[3]=this.post.death;
        console.log(provinceDic);
        //绘制全国地图
        $.getJSON('map/china.json', function(data){
          d = [];
          for( var i=0;i<data.features.length;i++ ){
            d.push({
              name:curDateData.newslist[i].provinceShortName,
              value:curDateData.newslist[i].confirmedCount
            })
          }
          console.log(d);
          mapdata = d;
          //注册地图
          echarts.registerMap('china', data);
          //绘制地图
          renderMap('china',d);
        });
        let provinceNameCache;
        //地图点击事件
        myChart.on('click', function (params) {
          console.log( params );
         
          if( params.name in provinces ){
            provinceNameCache=params.name;
            //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
            compass.post.name=params.name;
            $.getJSON('map/province/'+ provinces[params.name] +'.json', function(data){
              echarts.registerMap( params.name, data);
              compass.post.confirm=0;
              compass.post.curconfirm=0;
              compass.post.cure=0;
              compass.post.death=0;
              var d = [];
              for(let i in curDateData.newslist[provinceDic[params.name]].cities){
                compass.post.confirm+=curDateData.newslist[provinceDic[params.name]].cities[i].confirmedCount;
                compass.post.curconfirm+=curDateData.newslist[provinceDic[params.name]].cities[i].currentConfirmedCount;
                compass.post.cure+=curDateData.newslist[provinceDic[params.name]].cities[i].curedCount;
                compass.post.death+=curDateData.newslist[provinceDic[params.name]].cities[i].deadCount;
                d.push({
                    name:curDateData.newslist[provinceDic[params.name]].cities[i].cityName,
                    value:curDateData.newslist[provinceDic[params.name]].cities[i].confirmedCount
                })
                if(!cityDic[provinceDic[params.name]])
                {
                   cityDic[provinceDic[params.name]]={};
                }
                cityDic[provinceDic[params.name]][curDateData.newslist[provinceDic[params.name]].cities[i].cityName]=i;
               
              }
              renderMap(params.name,d);
            });
          }else{
              compass.post.name=curDateData.newslist[provinceDic[provinceNameCache]].cities[cityDic[provinceDic[provinceNameCache]][params.name]].cityName;
              compass.post.confirm=curDateData.newslist[provinceDic[provinceNameCache]].cities[cityDic[provinceDic[provinceNameCache]][params.name]].confirmedCount;
              compass.post.curconfirm=curDateData.newslist[provinceDic[provinceNameCache]].cities[cityDic[provinceDic[provinceNameCache]][params.name]].currentConfirmedCount;
              compass.post.cure=curDateData.newslist[provinceDic[provinceNameCache]].cities[cityDic[provinceDic[provinceNameCache]][params.name]].curedCount;
              compass.post.death=curDateData.newslist[provinceDic[provinceNameCache]].cities[cityDic[provinceDic[provinceNameCache]][params.name]].deadCount;

              console.log(params.name);
          }
        });
        document.oncontextmenu = function () { return false; };  //阻止浏览器指定区域的右键默认事件
        myChart.on('contextmenu',function(params){
          console.log(params.name);
            compass.post.name='全国'
            compass.post.confirm=chinaSickCount[0];
            compass.post.curconfirm=chinaSickCount[1];
            compass.post.cure=chinaSickCount[2];
            compass.post.death=chinaSickCount[3];
            renderMap('china',mapdata);
        })
        let option={ // 进行相关配置
          backgroundColor: "#333333",
          title: {
            text: '中国COVID-19疫情可视化',
            subtext: '数据来自各地卫健委',
            sublink: 'https://www.tianapi.com/apiview/169',
            left:30,
            top:10,
            textStyle:{
                color :'#c7c3c3',
                fontFamily :'Microsoft YaHei',
                fontSize:30
            } 
          },
          // xAxis: {
          //      data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
          // },
          // yAxis: {},
          tooltip: {}, // 鼠标移到图里面的浮动提示框
          visualMap: {
              left:30,
              bottom:30,
              pieces: [
                  {gte: 10000},
                  {gte: 1000, lte: 9999},
                  {gte: 100, lte: 999},
                  {gte: 10, lte: 99},
                  {gte: 1,lte: 9} ,    // 不指定 min，表示 min 为无限大（-Infinity）。

              ],
              textStyle: {
                  color: '#fff'
              }
          },
          // grid: {
          //   right: 500,
          //   top: 100,
          //   width: '10%'
          // }
        }
        function renderMap(map,data){
            option.series = [{
                    name: "累计确诊病例数",
                    type: 'map',
                    mapType: map,
                    left:270,
                    roam: false,
                    zoom:1.15,
                    nameMap:{
                        'china':'中国'
                    },
                    label: {
                        normal:{
                          show:true,
                          textStyle:{
                            color:'#ffffff',
                            fontSize:10
                          }  
                        },
                        emphasis: {
                            show: true,
                            textStyle:{
                            color:'#fff',
                            fontSize:13
                          }
                        }
                    },
                    itemStyle: {
                        normal: {
                            areaColor: '#323c48',
                            borderColor: 'dodgerblue'
                        },
                        emphasis: {
                            areaColor: 'darkorange'
                        }
                    },
                    data:data
                }
                // ,	
                // {
                //     barWidth:10,
                //     name: '销量',
                //     type: 'bar',
                //     data: [5, 20, 36, 10, 10, 20]
                // }
            ];
            //渲染地图
            myChart.setOption(option);
        }
      },
      //旧函数
      chinaConfigure() {
        console.log(this.userJson);
        let curDate=new Date(),year=curDate.getFullYear(),month=curDate.getMonth()+1,day=curDate.getDate();
        let apiDateParm;
        month<10?month='0'+month:month;
        day<10?day='0'+day:day;
        apiDateParm=year+'-'+month+'-'+day;//字符串拼接完成
        //ReqNcovData 获取当天数据并缓存
        let ReqNcovData=function(){
            try {
                $.get("http://api.tianapi.com/txapi/ncovcity/index?key=94e33ede5541c9f590b048ecfe4131de",
                    function(data){
                        if(data.code==200)
                        {
                            localStorage.setItem(apiDateParm,JSON.stringify(data));
                            console.log(data);
                            alert("状态码：" + data.code + "\n消息：" + data.msg);
                            option.series[1].data=RetrEchartData(data);
                            myChart.setOption(option);
                        }
                        else{
                            alert(data.msg);
                        }
                });
            } catch (error) {
                alert("调用疫情数据API失败")
            }
        };
        //RetrEchartData 解析获取符合
        let RetrEchartData=function(data){
           let echartData=[],obj;
           for(let i in data.newslist)
           {
              obj={};
              obj.name=data.newslist[i].provinceShortName;
              obj.value=data.newslist[i].confirmedCount;
              echartData.push(obj);
           }
           return echartData;
        }
        let myChart = echarts.init(this.$refs.myEchart); //这里是为了获得容器所在位置    
        window.onresize = myChart.resize;
        let option={ // 进行相关配置
          backgroundColor: "#333333",
          title: {
            text: '2019-nCov中国疫情可视化',
            subtext: '数据来自各地卫健委',
            sublink: 'https://www.tianapi.com/apiview/169',
            left:30,
            top:10,
            textStyle:{
                color :'#c7c3c3',
                fontFamily :'Microsoft YaHei',
                fontSize:30
            } 
          },
          tooltip: {}, // 鼠标移到图里面的浮动提示框
          geo: { // 这个是重点配置区
            map: 'china', // 表示中国地图
            roam: true,
            left:80,
            zoom:1.15,
            label: {
              normal: {
                show: true, // 是否显示对应地名
                textStyle: {
                  color: 'rgba(0,0,0,1)'
                }
              }
            },
            itemStyle: {
              normal: {
                borderColor: 'rgba(0, 0, 0, 0.2)'
              },
              emphasis: {
                areaColor: null,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }, 
         visualMap: {
            left:30,
            bottom:30,
            pieces: [
                {min: 10000},
                {min: 1000, max: 9999},
                {min: 100, max: 999},
                {min: 10, max: 99},
                {max: 9}     // 不指定 min，表示 min 为无限大（-Infinity）。
            ],
            textStyle: {
                color: '#fff'
            }
          },
          series: [{
              type: 'scatter',
              coordinateSystem: 'geo' // 对应上方配置
            },
            {
              name: '累计确诊病例', // 浮动框的标题
              type: 'map',
              geoIndex: 0,
              data: []
            }
          ]
        }
        if(!localStorage.getItem(apiDateParm))
        {
          ReqNcovData();
        }else{
          let allData=JSON.parse(localStorage.getItem(apiDateParm));//将当天缓存在localstrorage中对象解析出来\
          console.log(allData);
          option.series[1].data=RetrEchartData(allData);
          myChart.setOption(option);
        }
      
      }
    }
  }
</script>

<style scoped>
   #map{
       height: 800px;
       width: 100%;
   }
</style>