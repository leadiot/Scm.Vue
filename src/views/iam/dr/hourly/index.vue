<template>
    <el-container>
        <el-header>
            <div class="left-panel">
                <el-date-picker v-model="param.date" type="date" style="width: 300px;" @change="search()" />
                <el-divider direction="vertical"></el-divider>
                <sc-select v-model="param.app_id" placeholder="请选择" :data="app_list" @change="search()" />
            </div>
        </el-header>
        <el-main class="nopadding">
            <el-card shadow="never" header="数据报表">
                <scCharts height="600px" :option="optionCharts"></scCharts>
            </el-card>
        </el-main>
    </el-container>
</template>

<script>
import scCharts from "@/components/scCharts";

export default {
    name: "home_data",
    components: {
        scCharts
    },
    data() {
        return {
            param: {
                date: new Date(),
                app_id: this.$SCM.ID_ALL,
            },
            optionCharts: {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross' }
                },
                legend: {},
                xAxis: [
                    {
                        type: 'category',
                        axisTick: {
                            alignWithLabel: true
                        },
                        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: '调用数量',
                        position: 'right',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    },
                    {
                        type: 'value',
                        name: '成功数量',
                        position: 'left',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],
                series: [
                    {
                        name: '调用数量',
                        type: 'bar',
                        yAxisIndex: 0,
                        data: []
                    },
                    {
                        name: '成功数量',
                        type: 'line',
                        smooth: true,
                        yAxisIndex: 1,
                        data: []
                    }
                ]
            },
            app_list: [this.$SCM.OPTION_ALL],
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        async init() {
            //this.param.date = this.$TOOL.getDate();
            this.$SCM.list_option(this.app_list, this.$API.iamresappheader.option, {}, false);
            this.search();
        },
        async search() {
            var data = {};
            data.date = this.$TOOL.getDate(this.param.date);
            data.app_id = this.param.app_id;

            var res = await this.$API.iamdrapphourly.hourly.get(data);
            if (res != null && res.code == 200) {
                this.optionCharts.xAxis[0].data = res.data.titles;
                this.optionCharts.series[0].data = res.data.data1;
                this.optionCharts.series[1].data = res.data.data2;
            }
        }
    }
}
</script>