import{J as m,Nt as t,Z as v,bt as w,tt as e,wt as d}from"./vue-vendor-C9JtNgw0.js";import{t as T}from"./_plugin-vue_export-helper-B4yulpIB.js";import{h as y}from"./index-DTFroggO.js";import{t as V}from"./scCode-CqwdEulX.js";var h={name:"scui_form_table",components:{scCode:V,scDynamicTable:y},data(){return{example1:{list:[],addTemplate:{name:"",age:0,score:"A"},code:`<sc-dynamic-table ref="formTable" v-model="list" :addTemplate="addTemplate">
    <el-table-column label="姓名" prop="name">
        <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="请输入姓名"></el-input>
        </template>
    </el-table-column>
    <el-table-column label="年龄" prop="age">
        <template #default="scope">
            <el-input-number v-model="scope.row.age" placeholder="请输入年龄"></el-input-number>
        </template>
    </el-table-column>
    <el-table-column label="分数" prop="score">
        <template #default="scope">
            <el-select v-model="scope.row.score" placeholder="请输入分数">
                <el-option label="A" value="A"></el-option>
                <el-option label="B" value="B"></el-option>
                <el-option label="C" value="C"></el-option>
            </el-select>
        </template>
    </el-table-column>
</sc-dynamic-table>`},fieldTable:[{name:"modelValue",type:"Array",desc:"动态表格数据",val:"",def:"[]"},{name:"isAdd",type:"Boolean",desc:"是否显示新增按钮",val:"",def:"true"},{name:"addTemplate",type:"Object",desc:"动态表格新增行模板",val:"",def:"{}"},{name:"placeholder",type:"String",desc:"无数据时提示信息",val:"",def:"暂无数据"},{name:"dragSort",type:"Boolean",desc:"是否开启拖拽排序",val:"",def:"false"},{name:"tableHeight",type:"Object",desc:"动态表格高度",val:"",def:"300px"}],eventTable:[]}},methods:{}},g={class:"doc-content"},x={class:"doc-content__body"};function B(C,a,A,U,n,D){const s=d("el-input"),l=d("el-table-column"),u=d("el-input-number"),r=d("el-option"),b=d("el-select"),i=d("sc-dynamic-table"),_=d("sc-code"),c=d("el-table"),f=d("el-card");return w(),v("div",g,[m("div",x,[e(f,null,{default:t(()=>[a[1]||(a[1]=m("h1",null,"FormTable 动态表格组件",-1)),a[2]||(a[2]=m("p",null,"FormTable 组件用于动态构建表格。",-1)),e(_,{lang:"html",code:n.example1.code,title:"基础用法",desc:"FormTable 组件默认使用示例。"},{default:t(()=>[e(i,{ref:"formTable",modelValue:n.example1.list,"onUpdate:modelValue":a[0]||(a[0]=o=>n.example1.list=o),addTemplate:n.example1.addTemplate},{default:t(()=>[e(l,{label:"姓名",prop:"name"},{default:t(o=>[e(s,{modelValue:o.row.name,"onUpdate:modelValue":p=>o.row.name=p,placeholder:"请输入姓名"},null,8,["modelValue","onUpdate:modelValue"])]),_:1}),e(l,{label:"年龄",prop:"age"},{default:t(o=>[e(u,{modelValue:o.row.age,"onUpdate:modelValue":p=>o.row.age=p,placeholder:"请输入年龄"},null,8,["modelValue","onUpdate:modelValue"])]),_:1}),e(l,{label:"分数",prop:"score"},{default:t(o=>[e(b,{modelValue:o.row.score,"onUpdate:modelValue":p=>o.row.score=p,placeholder:"请输入分数"},{default:t(()=>[e(r,{label:"A",value:"A"}),e(r,{label:"B",value:"B"}),e(r,{label:"C",value:"C"})]),_:1},8,["modelValue","onUpdate:modelValue"])]),_:1})]),_:1},8,["modelValue","addTemplate"])]),_:1},8,["code"]),a[3]||(a[3]=m("h2",null,"属性",-1)),e(c,{data:n.fieldTable,style:{width:"100%"}},{default:t(()=>[e(l,{prop:"name",label:"属性名",width:"120"}),e(l,{prop:"desc",label:"说明"}),e(l,{prop:"type",label:"类型",width:"80"}),e(l,{prop:"val",label:"可选值",width:"120"}),e(l,{prop:"def",label:"默认值",width:"120"})]),_:1},8,["data"]),a[4]||(a[4]=m("h2",null,"事件",-1)),e(c,{data:n.eventTable,style:{width:"100%"}},{default:t(()=>[e(l,{prop:"name",label:"事件名",width:"120"}),e(l,{prop:"desc",label:"说明"}),e(l,{prop:"args",label:"回调参数",width:"120"})]),_:1},8,["data"])]),_:1})])])}var O=T(h,[["render",B]]);export{O as default};
