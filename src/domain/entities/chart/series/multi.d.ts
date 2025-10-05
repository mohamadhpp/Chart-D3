import { ChartBase } from "../base";

export default interface MultiSeriesChart extends ChartBase
{
    data: [number, number[]][];
}