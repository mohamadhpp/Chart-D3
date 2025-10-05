import React, {useEffect, useState} from "react";
import {SeriesChart} from "@/domain/entities/chart/series";
import {getSeriesData} from "@/infrastructure/api/chart/series";
import DotLoader from "@/presentation/components/ui-kit/common/dot-loader";
import LineChart from "@/presentation/components/ui-kit/chart/line-chart";

export const ChartPage = () =>
{
    const [charts, setCharts] = useState<SeriesChart[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    const fetchData = () =>
    {
        setIsFetching(true);
        getSeriesData()
            .then((data: SeriesChart[]) => setCharts(data))
            .catch((error: unknown) =>
            {
                console.log(error);
            })
            .finally(() => setIsFetching(false));
    }

    useEffect(() =>
    {
        fetchData();
    }, []);

    return (
        <div className="h-screen overflow-y-scroll">
            <div className="w-full flex flex-col items-center justify-center gap-[25px] py-[35px]">
                { isFetching && <DotLoader/> }

                { charts.length == 0 &&
                    <p>
                        No data found to display.
                    </p>
                }

                { charts.length > 0 &&
                    charts.map((chart: SeriesChart, index: number) => <LineChart key={`chart-${index}`}
                                                                                          chart={chart} />
                    )
                }
            </div>
        </div>
    );
};