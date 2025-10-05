import { SingleSeriesChart } from "@/domain/entities/chart/series/single";
import { MultiSeriesChart } from "@/domain/entities/chart/series/multi";

export type SeriesChart = SingleSeriesChart | MultiSeriesChart;