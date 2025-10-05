import { ChartBase } from "../base";

export default interface SingleSeriesChart extends ChartBase
{
    data: [number, number][];
}