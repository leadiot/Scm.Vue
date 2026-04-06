import{J as c,Nt as o,Z as v,bt as C,et as m,pn as x,tt as t,wt as i}from"./vue-vendor-C9JtNgw0.js";import{t as S}from"./_plugin-vue_export-helper-B4yulpIB.js";import{t as $}from"./scCode-CqwdEulX.js";var k={name:"scui_table",components:{scCode:$},data(){return{tableName:"scui_table",apiObj:this.$API.scmurgroup.list,param:{key:""},selection:[],column:[{label:"id",prop:"id",hide:!0},{prop:"namec",label:"群组名称",width:200,align:"left"},{prop:"remark",label:"备注",minWidth:200,align:"left"},{prop:"row_status",label:"数据状态",width:"80"},{prop:"update_names",label:"更新人员",width:"100"},{prop:"update_times",label:"更新时间",width:"160"},{prop:"create_names",label:"创建人员",width:"100"},{prop:"create_times",label:"创建时间",width:"160"}],code1:`<sc-table ref="table" :table-name="tableName" :api-obj="apiObj" :column="column" hide-pagination
    is-tree row-key="id" @menu-handle="menuHandle" @selection-change="selectionChange">
    <el-table-column fixed type="selection" width="60" />

    <el-table-column align="center" fixed="right" label="操作" width="140">
        <template #default="scope">
            <el-button size="small" text type="primary" @click="open_dialog(scope.row)">
                编辑
            </el-button>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定删除吗？" @confirm="delete_item(scope.row, scope.$index)">
                <template #reference>
                    <el-button text type="primary" size="small">删除</el-button>
                </template>
            </el-popconfirm>
        </template>
    </el-table-column>

    <template #row_status="scope">
        <el-tooltip :content="scope.row.row_status ? '正常' : '停用'" placement="right">
            <el-switch v-model="scope.row.row_status" :active-value="1" :inactive-value="2"
                @change="status_item($event, scope.row)">
            </el-switch>
        </el-tooltip>
    </template>

    <template #isSystem="{ data }">
        <el-tag :type="data.isSystem ? 'success' : 'danger'">
            {{ data.isSystem ? "是" : "否" }}
        </el-tag>
    </template>
</sc-table>`}},methods:{search(e){e!=null&&(this.param.key=e),this.$refs.table.upData(this.param)},async status_item(e,l){this.$SCM.status_item(this,this.$API.scmurgroup.status,l,l.row_status)},status_list(e){this.$SCM.status_list(this,this.$API.scmurgroup.status,this.selection,e)},async delete_item(e){this.$SCM.delete_item(this,this.$API.scmurgroup.delete,e)},delete_list(){this.$SCM.delete_list(this,this.$API.scmurgroup.delete,this.selection)},open_dialog(e){this.$refs.edit.open(e)},selectionChange(e){this.selection=e},menuHandle(e){e.command=="add"&&this.open_dialog({}),e.command=="edit"&&this.open_dialog(e.row),e.command=="delete"&&this.delete_item(e.row)}}},N={class:"doc-content"},V={class:"doc-content__body"};function M(e,l,A,H,r,n){const d=i("el-table-column"),p=i("el-button"),u=i("el-divider"),_=i("el-popconfirm"),h=i("el-switch"),b=i("el-tooltip"),f=i("el-tag"),w=i("sc-table"),g=i("sc-code"),y=i("el-card");return C(),v("div",N,[c("div",V,[t(y,null,{default:o(()=>[l[2]||(l[2]=c("h1",null,"Table 表格组件",-1)),l[3]||(l[3]=c("p",null,"Table 组件用于展示列表数据。",-1)),t(g,{lang:"html",code:r.code1,title:"基础用法",desc:"Table 组件默认使用示例。"},{default:o(()=>[t(w,{ref:"table","table-name":r.tableName,"api-obj":r.apiObj,column:r.column,"hide-pagination":"","is-tree":"","row-key":"id",onMenuHandle:n.menuHandle,onSelectionChange:n.selectionChange},{row_status:o(a=>[t(b,{content:a.row.row_status?"正常":"停用",placement:"right"},{default:o(()=>[t(h,{modelValue:a.row.row_status,"onUpdate:modelValue":s=>a.row.row_status=s,"active-value":1,"inactive-value":2,onChange:s=>n.status_item(s,a.row)},null,8,["modelValue","onUpdate:modelValue","onChange"])]),_:2},1032,["content"])]),isSystem:o(({data:a})=>[t(f,{type:a.isSystem?"success":"danger"},{default:o(()=>[m(x(a.isSystem?"是":"否"),1)]),_:2},1032,["type"])]),default:o(()=>[t(d,{fixed:"",type:"selection",width:"60"}),t(d,{align:"center",fixed:"right",label:"操作",width:"140"},{default:o(a=>[t(p,{size:"small",text:"",type:"primary",onClick:s=>n.open_dialog(a.row)},{default:o(()=>[...l[0]||(l[0]=[m(" 编辑 ",-1)])]),_:1},8,["onClick"]),t(u,{direction:"vertical"}),t(_,{title:"确定删除吗？",onConfirm:s=>n.delete_item(a.row,a.$index)},{reference:o(()=>[t(p,{text:"",type:"primary",size:"small"},{default:o(()=>[...l[1]||(l[1]=[m("删除",-1)])]),_:1})]),_:1},8,["onConfirm"])]),_:1})]),_:1},8,["table-name","api-obj","column","onMenuHandle","onSelectionChange"])]),_:1},8,["code"])]),_:1})])])}var z=S(k,[["render",M]]);export{z as default};
