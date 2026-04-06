import{J as m,Nt as l,Z as x,bt as f,et as b,tt as e,wt as c}from"./vue-vendor-C9JtNgw0.js";import{t as v}from"./_plugin-vue_export-helper-B4yulpIB.js";import{c as C,s as h}from"./index-DTFroggO.js";import{t as w}from"./scCode-CqwdEulX.js";var y={name:"scui_contextmenu",components:{scCode:w,scContextmenu:C,scContextmenuItem:h},data(){return{visible:!1,top:0,left:0,example1:{code:`<sc-contextmenu ref="contextmenu">
    <sc-contextmenu-item title="全选"></sc-contextmenu-item>
    <sc-contextmenu-item title="复制"></sc-contextmenu-item>
    <sc-contextmenu-item title="粘贴"></sc-contextmenu-item>
    <sc-contextmenu-item title="多级菜单" divided>
        <sc-contextmenu-item title="子菜单1"></sc-contextmenu-item>
        <sc-contextmenu-item title="子菜单2"></sc-contextmenu-item>
    </sc-contextmenu-item>
    <sc-contextmenu-item title="关闭" divided></sc-contextmenu-item>
</sc-contextmenu>
&lt;script scoped>
    shuowMenu(e){
        this.$refs.contextmenu.openMenu(e);
    }
&lt;/script>`.replaceAll("&lt;","<")},fieldTable:[],eventTable:[],methodTable:[]}},methods:{menuClick(s){console.log(s)},cm(s){this.$refs.contextmenu.openMenu(s)}}},T={class:"doc-content"},k={class:"doc-content__body"};function g(s,t,N,B,i,u){const a=c("el-button"),o=c("sc-contextmenu-item"),p=c("sc-contextmenu"),r=c("sc-code"),n=c("el-table-column"),d=c("el-table"),_=c("el-card");return f(),x("div",T,[m("div",k,[e(_,null,{default:l(()=>[t[1]||(t[1]=m("h1",null,"Contextmenu 上下文菜单组件",-1)),t[2]||(t[2]=m("p",null,"Contextmenu 上下文菜单组件用于显示上下文菜单示例。",-1)),e(r,{lang:"html",code:i.example1.code,title:"基础用法",desc:"Contextmenu 组件默认显示上下文菜单示例。"},{default:l(()=>[e(a,{type:"primary",onClick:u.cm},{default:l(()=>[...t[0]||(t[0]=[b("点击显示弹出菜单",-1)])]),_:1},8,["onClick"]),e(p,{ref:"contextmenu"},{default:l(()=>[e(o,{title:"全选"}),e(o,{title:"复制"}),e(o,{title:"粘贴"}),e(o,{title:"多级菜单",divided:""},{default:l(()=>[e(o,{title:"子菜单1"}),e(o,{title:"子菜单2"})]),_:1}),e(o,{title:"关闭",divided:""})]),_:1},512)]),_:1},8,["code"]),t[3]||(t[3]=m("h2",null,"属性",-1)),e(d,{data:i.fieldTable,style:{width:"100%"}},{default:l(()=>[e(n,{prop:"name",label:"属性名",width:"120"}),e(n,{prop:"desc",label:"说明"}),e(n,{prop:"type",label:"类型",width:"80"}),e(n,{prop:"val",label:"可选值",width:"120"}),e(n,{prop:"def",label:"默认值",width:"120"})]),_:1},8,["data"]),t[4]||(t[4]=m("h2",null,"事件",-1)),e(d,{data:i.eventTable,style:{width:"100%"}},{default:l(()=>[e(n,{prop:"name",label:"事件名",width:"120"}),e(n,{prop:"desc",label:"说明"}),e(n,{prop:"args",label:"回调参数",width:"120"})]),_:1},8,["data"])]),_:1})])])}var E=v(y,[["render",g]]);export{E as default};
