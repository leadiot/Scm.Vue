import * as echarts from 'echarts/core';
import { BarChart, LineChart, MapChart, GaugeChart } from 'echarts/charts';
import {
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
	VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
	BarChart, LineChart, MapChart, GaugeChart,
	TitleComponent, TooltipComponent, LegendComponent, GridComponent, VisualMapComponent,
	CanvasRenderer,
]);

export default echarts;
