<template>
  <div id="title">
     <h1>
        截止{{msg.year}}年{{msg.month}}月{{msg.day}}日
     </h1>
    <h2>
        {{msg.name}}
        累计确诊：
        {{msg.confirm}}
        <br/>
        当前确诊：
        {{msg.curconfirm}}
        <br/>
        累计治愈：
        {{msg.cure}}
        <br/>
        累计死亡：
        {{msg.death}}
        <br/>
        <!-- 疑似：
        {{msg.suspect}} -->
    </h2>
  </div>
</template>

<script>
export default {
   name: 'visTitle',
   props:{
      msg:Object
   }
}
</script>

<style scoped>
   #title{
       position: absolute;
       bottom: 260px;
       right: 80px;
       z-index: 1;
       font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
       font-style: oblique;
       color: darkgrey
   }
</style>
