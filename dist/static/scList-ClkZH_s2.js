import{J as o,Nt as t,Z as m,bt as u,et as x,tt as e,wt as i}from"./vue-vendor-C9JtNgw0.js";import{t as v}from"./_plugin-vue_export-helper-B4yulpIB.js";import{t as f}from"./scCode-CqwdEulX.js";var b={name:"scui_list",components:{scCode:f},data(){return{example1:{code:`<sc-list :data="list" />
<script> 
export default{
    data(){
        return {
            list:[{ id: 1, label: '红色', value: '1' },
                { id: 2, label: '黄色', value: '2' },
                { id: 3, label: '蓝色', value: '3' }
            ]
        }
    }
}
<\/script>`,data:[{id:1,label:"红色",value:"1"},{id:2,label:"黄色",value:"2"},{id:3,label:"蓝色",value:"3"}]},example2:{code:`<sc-list :data="list" icon="sc-folder-open-line" />
<script> 
export default{
    data(){
        return {
            list:[{ id: 1, label: '红色', value: '1' },
                { id: 2, label: '黄色', value: '2' },
                { id: 3, label: '蓝色', value: '3' }
            ]
        }
    }
}
<\/script>`,data:[{id:1,label:"红色",value:"1"},{id:2,label:"黄色",value:"2"},{id:3,label:"蓝色",value:"3"}]},example3:{code:`<sc-list :data="list" icon="sc-folder-open-line" >
    <template #header>
        <div style="font-size: 17px;padding: 15px 20px;">
            <sc-icon name="sc-palette-line"></sc-icon>
            颜色
        </div>
    </template>
</sc-list>
<script> 
export default{
    data(){
        return {
            list:[{ id: 1, label: '红色', value: '1' },
                { id: 2, label: '黄色', value: '2' },
                { id: 3, label: '蓝色', value: '3' }
            ]
        }
    }
}
<\/script>`,data:[{id:1,label:"红色",value:"1"},{id:2,label:"黄色",value:"2"},{id:3,label:"蓝色",value:"3"}]},example4:{code:`<sc-list :data="list" icon="sc-folder-open-line" header="颜色">
    <template #footer>
        <div style="text-align: right;padding: 5px; color: #999;">共3种可用颜色</div>
    </template>
</sc-list>
<script> 
export default{
    data(){
        return {
            list:[{ id: 1, label: '红色', value: '1' },
                { id: 2, label: '黄色', value: '2' },
                { id: 3, label: '蓝色', value: '3' }
            ]
        }
    }
}
<\/script>`,data:[{id:1,label:"红色",value:"1"},{id:2,label:"黄色",value:"2"},{id:3,label:"蓝色",value:"3"}]},fieldTable:[{name:"header",type:"String",desc:"列表头",val:"",def:""},{name:"footer",type:"String",desc:"列表尾",val:"",def:""},{name:"icon",type:"String",desc:"列表项图标",val:"",def:""},{name:"data",type:"Array",desc:"列表数据",val:"",def:""},{name:"width",type:"Number",desc:"列表宽度",val:"",def:""},{name:"columns",type:"Number",desc:"列表显示列数",val:"",def:"1"},{name:"padding",type:"Number",desc:"列表内衬大小",val:"",def:"0"},{name:"emptyText",type:"String",desc:"为空时显示文本",val:"",def:"内容为空"},{name:"showOpt",type:"Boolean",desc:"是否显示操作面板",val:"",def:"false"},{name:"showEdit",type:"Boolean",desc:"是否显示编辑按钮",val:"",def:"false"},{name:"showDrop",type:"Boolean",desc:"是否显示删除按钮",val:"",def:"false"}],eventTable:[{name:"change",desc:"选择项变化事件",args:"item,index"},{name:"editItem",desc:"列表项编辑事件",args:"item,index"},{name:"dropItem",desc:"列表项删除事件",args:"item,index"}]}},mounted(){},methods:{}},_={class:"doc-content"},g={class:"doc-content__body"},h={style:{"font-size":"17px",padding:"15px 20px"}};function y(w,l,N,B,a,T){const s=i("sc-list"),n=i("sc-code"),p=i("sc-icon"),d=i("el-table-column"),c=i("el-table"),r=i("el-card");return u(),m("div",_,[o("div",g,[e(r,null,{default:t(()=>[l[2]||(l[2]=o("h1",null,"List 列表组件",-1)),l[3]||(l[3]=o("p",null,"List 列表组件用于显示一个列表数据。",-1)),e(n,{lang:"html",code:a.example1.code,title:"基础用法",desc:"用于显示一个列表数据。"},{default:t(()=>[e(s,{data:a.example1.data},null,8,["data"])]),_:1},8,["code"]),e(n,{lang:"html",code:a.example2.code,title:"带图标",desc:"用于显示一个列表数据，可以指定图标。"},{default:t(()=>[e(s,{data:a.example2.data,icon:"sc-folder-open-line"},null,8,["data"])]),_:1},8,["code"]),e(n,{lang:"html",code:a.example3.code,title:"显示头信息",desc:"用于显示一个列表数据，可以指定图标。"},{default:t(()=>[e(s,{data:a.example3.data,icon:"sc-folder-open-line"},{header:t(()=>[o("div",h,[e(p,{name:"sc-palette-line"}),l[0]||(l[0]=x(" 颜色 ",-1))])]),_:1},8,["data"])]),_:1},8,["code"]),e(n,{lang:"html",code:a.example4.code,title:"显示尾信息",desc:"用于显示一个列表数据，可以指定图标。"},{default:t(()=>[e(s,{data:a.example4.data,icon:"sc-folder-open-line",header:"颜色"},{footer:t(()=>[...l[1]||(l[1]=[o("div",{style:{"text-align":"right",padding:"5px",color:"#999"}},"共3种可用颜色",-1)])]),_:1},8,["data"])]),_:1},8,["code"]),l[4]||(l[4]=o("h2",null,"属性",-1)),e(c,{data:a.fieldTable,style:{width:"100%"}},{default:t(()=>[e(d,{prop:"name",label:"属性名",width:"120"}),e(d,{prop:"desc",label:"说明"}),e(d,{prop:"type",label:"类型",width:"80"}),e(d,{prop:"val",label:"可选值",width:"120"}),e(d,{prop:"def",label:"默认值",width:"120"})]),_:1},8,["data"]),l[5]||(l[5]=o("h2",null,"事件",-1)),e(c,{data:a.eventTable,style:{width:"100%"}},{default:t(()=>[e(d,{prop:"name",label:"事件名",width:"120"}),e(d,{prop:"desc",label:"说明"}),e(d,{prop:"args",label:"回调参数",width:"120"})]),_:1},8,["data"])]),_:1})])])}var V=v(b,[["render",y]]);export{V as default};
