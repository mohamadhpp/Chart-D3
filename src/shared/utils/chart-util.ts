import {SeriesChart} from "@/domain/entities/chart/series";
import MultiSeriesChart from "@/domain/entities/chart/series/multi";

const isMultiSeries = (c: SeriesChart): c is MultiSeriesChart =>
{
    return c.data.length > 0 && Array.isArray(c.data[0][1]);
};

export { isMultiSeries }