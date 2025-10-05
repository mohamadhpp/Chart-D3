import {SeriesChart} from "@/domain/entities/chart/series";

const getSeriesData = async (): Promise<SeriesChart[]> =>
{
    const res = await fetch("data/series.json");

    if (!res.ok)
        throw new Error("Failed to load series.json");

    const data = await res.json();

    return data as SeriesChart[];
}

export { getSeriesData }