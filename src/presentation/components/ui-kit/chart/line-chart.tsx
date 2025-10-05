import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import SingleSeriesChart from "@/domain/entities/chart/series/single";
import MultiSeriesChart from "@/domain/entities/chart/series/multi";
import {SeriesChart} from "@/domain/entities/chart/series";
import {isMultiSeries} from "@/shared/utils/chart-util";

interface LineChartProps
{
    chart: SeriesChart;
}

const LineChart: React.FC<LineChartProps> = ({ chart }) =>
{
    const chartRef = useRef<HTMLDivElement>(null);

    const renderSingleSeriesChart = (chart: SingleSeriesChart) =>
    {
        const container = chartRef.current;

        if (!container)
            return;

        d3.select(container).selectAll('*').remove();

        // Chart dimensions and margins
        const width = 928;
        const height = 500;
        const marginTop = 20;
        const marginRight = 30;
        const marginBottom = 30;
        const marginLeft = 40;

        // Transform data to required format
        const data = chart.data.map(([timestamp, value]) => ({
            timestamp,
            value
        }));

        // Check if we have valid data
        const hasValidData = data.some(d => d.value !== null);
        if (!hasValidData)
        {
            const svg = d3.select(container)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .text('No valid data to display');
            return;
        }

        // Declare the x (horizontal position) scale
        const x = d3.scaleLinear(
            d3.extent(data, d => d.timestamp) as [number, number],
            [marginLeft, width - marginRight]
        );

        // Declare the y (vertical position) scale
        const y = d3.scaleLinear(
            [0, d3.max(data, d => d.value !== null ? d.value : 0) as number],
            [height - marginBottom, marginTop]
        );

        // Declare the line generator
        const line = d3.line<{ timestamp: number; value: number | null }>()
            .defined(d => d.value !== null)
            .x(d => x(d.timestamp))
            .y(d => y(d.value as number));

        // Create the SVG container
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto;');

        // Create clip path
        svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', marginLeft)
            .attr('y', marginTop)
            .attr('width', width - marginLeft - marginRight)
            .attr('height', height - marginTop - marginBottom);

        // Create group for zoomable content
        const g = svg.append('g')
            .attr('clip-path', 'url(#clip)');

        // Add the x-axis
        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

        // Add the y-axis, remove the domain line, add grid lines
        svg.append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(height / 40))
            .call(g => g.select('.domain').remove());

        // Add grid lines
        const grid = svg.append('g')
            .attr('class', 'grid')
            .attr('clip-path', 'url(#clip)');

        grid.selectAll('line')
            .data(y.ticks(height / 40))
            .enter()
            .append('line')
            .attr('x1', marginLeft)
            .attr('x2', width - marginRight)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.1);

        // Append a path for the line with gaps (gray)
        g.append('path')
            .attr('class', 'line-bg')
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.5)
            .attr('d', line(data.filter(d => d.value !== null)));

        // Append a path for the line (blue)
        g.append('path')
            .attr('class', 'line-fg')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line(data));

        // Create tooltip
        const tooltip = d3.select(container)
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000');

        // Create invisible overlay for mouse tracking
        const bisect = d3.bisector((d: { timestamp: number; value: number | null }) => d.timestamp).left;

        svg.append('rect')
            .attr('class', 'overlay')
            .attr('x', marginLeft)
            .attr('y', marginTop)
            .attr('width', width - marginLeft - marginRight)
            .attr('height', height - marginTop - marginBottom)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mousemove', function(event)
            {
                const [mx] = d3.pointer(event);
                const xVal = x.invert(mx);
                const index = bisect(data, xVal, 1);
                const d0 = data[index - 1];
                const d1 = data[index];
                const d = d1 && (xVal - d0.timestamp > d1.timestamp - xVal) ? d1 : d0;

                if (d && d.value !== null)
                {
                    tooltip
                        .style('visibility', 'visible')
                        .html(`<strong>Time:</strong> ${d.timestamp.toFixed(0)}<br/><strong>Value:</strong> ${d.value.toFixed(3)}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');

                    // Update or create focus circle
                    let focus = g.select('.focus-circle');
                    if (focus.empty())
                    {
                        focus = g.append('circle')
                            .attr('class', 'focus-circle')
                            .attr('r', 4)
                            .attr('fill', 'steelblue')
                            .attr('stroke', 'white')
                            .attr('stroke-width', 2);
                    }

                    focus
                        .attr('cx', x(d.timestamp))
                        .attr('cy', y(d.value))
                        .style('display', null);
                }
            })
            .on('mouseout', function()
            {
                tooltip.style('visibility', 'hidden');
                g.select('.focus-circle').style('display', 'none');
            });

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', marginTop - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(chart.title);

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 50])
            .translateExtent([[marginLeft, 0], [width - marginRight, height]])
            .extent([[marginLeft, 0], [width - marginRight, height]])
            .on('zoom', (event) =>
            {
                const newX = event.transform.rescaleX(x);

                // Update x-axis
                xAxis.call(d3.axisBottom(newX).ticks(width / 80).tickSizeOuter(0));

                // Update line paths
                const newLine = d3.line<{ timestamp: number; value: number | null }>()
                    .defined(d => d.value !== null)
                    .x(d => newX(d.timestamp))
                    .y(d => y(d.value as number));

                g.select('.line-bg').attr('d', newLine(data.filter(d => d.value !== null)));
                g.select('.line-fg').attr('d', newLine(data));

                // Update overlay for correct mouse tracking after zoom
                svg.select('.overlay')
                    .on('mousemove', function(event)
                    {
                        const [mx] = d3.pointer(event);
                        const xVal = newX.invert(mx);
                        const index = bisect(data, xVal, 1);
                        const d0 = data[index - 1];
                        const d1 = data[index];
                        const d = d1 && (xVal - d0.timestamp > d1.timestamp - xVal) ? d1 : d0;

                        if (d && d.value !== null)
                        {
                            tooltip
                                .style('visibility', 'visible')
                                .html(`<strong>Time:</strong> ${d.timestamp.toFixed(0)}<br/><strong>Value:</strong> ${d.value.toFixed(3)}`)
                                .style('left', (event.pageX + 10) + 'px')
                                .style('top', (event.pageY - 10) + 'px');

                            let focus = g.select('.focus-circle');

                            if (focus.empty())
                            {
                                focus = g.append('circle')
                                    .attr('class', 'focus-circle')
                                    .attr('r', 4)
                                    .attr('fill', 'steelblue')
                                    .attr('stroke', 'white')
                                    .attr('stroke-width', 2);
                            }

                            focus
                                .attr('cx', newX(d.timestamp))
                                .attr('cy', y(d.value))
                                .style('display', null);
                        }
                    });
            });

        svg.call(zoom as never);

        // Add instructions
        svg.append('text')
            .attr('x', width - marginRight)
            .attr('y', height - 5)
            .attr('text-anchor', 'end')
            .style('font-size', '11px')
            .style('fill', '#666')
            .text('Scroll to zoom, drag to pan, hover for values');
    };

    const renderMultiSeriesChart = (chart: MultiSeriesChart) => 
    {
        const container = chartRef.current;
        
        if (!container) 
            return;

        d3.select(container).selectAll('*').remove();

        // Chart dimensions and margins
        const width = 928;
        const height = 500;
        const marginTop = 40;
        const marginRight = 30;
        const marginBottom = 30;
        const marginLeft = 40;

        // Transform data - each series independently handles its null values
        const allData = chart.data.map(([timestamp, values]) => ({
            timestamp,
            values
        }));

        // Determine number of series
        const numSeries = chart.data.length > 0 ? chart.data[0][1].length : 0;
        const colors = ['blue', 'green', 'red'];

        // Extract series data - keeping null values in the structure
        const series: Array<{
            name: string;
            color: string;
            data: Array<{ timestamp: number; value: number | null }>
        }> = [];

        for (let i = 0; i < numSeries; i++)
        {
            const seriesData = allData.map(d => (
            {
                timestamp: d.timestamp,
                value: d.values[i] !== null && d.values[i] !== undefined ? d.values[i] : null
            }));

            series.push({
                name: `Series ${i + 1}`,
                color: colors[i] || `hsl(${i * 60}, 70%, 50%)`,
                data: seriesData
            });
        }

        // Declare the x (horizontal position) scale
        const x = d3.scaleLinear(
            d3.extent(allData, d => d.timestamp) as [number, number],
            [marginLeft, width - marginRight]
        );

        // Collect all valid values for y-scale
        const allValues: number[] = [];
        chart.data.forEach(([, values]) =>
        {
            values.forEach(v =>
            {
                if (v !== null && v !== undefined)
                {
                    allValues.push(v);
                }
            });
        });

        const y = d3.scaleLinear(
            d3.extent(allValues) as [number, number],
            [height - marginBottom, marginTop]
        );

        // Create the SVG container
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .attr('style', 'max-width: 100%; height: auto;');

        // Create clip path
        svg.append('defs').append('clipPath')
            .attr('id', 'clip-multi')
            .append('rect')
            .attr('x', marginLeft)
            .attr('y', marginTop)
            .attr('width', width - marginLeft - marginRight)
            .attr('height', height - marginTop - marginBottom);

        // Create group for zoomable content
        const g = svg.append('g')
            .attr('clip-path', 'url(#clip-multi)');

        // Add the x-axis
        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

        // Add the y-axis and grid lines
        svg.append('g')
            .attr('transform', `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(height / 40))
            .call(g => g.select('.domain').remove());

        // Add grid lines
        const grid = svg.append('g')
            .attr('class', 'grid')
            .attr('clip-path', 'url(#clip-multi)');

        grid.selectAll('line')
            .data(y.ticks(height / 40))
            .enter()
            .append('line')
            .attr('x1', marginLeft)
            .attr('x2', width - marginRight)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.1);

        // Draw lines for each series with proper null handling
        series.forEach((s, idx) => 
        {
            // Line generator that skips null values
            const line = d3.line<{ timestamp: number; value: number | null }>()
                .defined(d => d.value !== null)
                .x(d => x(d.timestamp))
                .y(d => y(d.value as number));

            // Background path (gray) - only valid points
            g.append('path')
                .attr('class', `line-bg-${idx}`)
                .attr('fill', 'none')
                .attr('stroke', '#ccc')
                .attr('stroke-width', 1)
                .attr('d', line(s.data.filter(d => d.value !== null)));

            // Foreground path (colored) - with gaps
            g.append('path')
                .attr('class', `line-fg-${idx}`)
                .attr('fill', 'none')
                .attr('stroke', s.color)
                .attr('stroke-width', 2)
                .attr('d', line(s.data));
        });

        // Add legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 120}, ${marginTop})`);

        series.forEach((s, i) => 
        {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 20})`);

            legendRow.append('line')
                .attr('x1', 0)
                .attr('x2', 20)
                .attr('y1', 0)
                .attr('y2', 0)
                .attr('stroke', s.color)
                .attr('stroke-width', 2);

            legendRow.append('text')
                .attr('x', 25)
                .attr('y', 4)
                .style('font-size', '12px')
                .text(s.name);
        });

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', marginTop - 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(chart.title);

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 50])
            .translateExtent([[marginLeft, 0], [width - marginRight, height]])
            .extent([[marginLeft, 0], [width - marginRight, height]])
            .on('zoom', (event) => 
            {
                const newX = event.transform.rescaleX(x);

                // Update x-axis
                xAxis.call(d3.axisBottom(newX).ticks(width / 80).tickSizeOuter(0));

                // Update all series lines
                series.forEach((s, idx) => 
                {
                    const newLine = d3.line<{ timestamp: number; value: number | null }>()
                        .defined(d => d.value !== null)
                        .x(d => newX(d.timestamp))
                        .y(d => y(d.value as number));

                    g.select(`.line-bg-${idx}`).attr('d', newLine(s.data.filter(d => d.value !== null)));
                    g.select(`.line-fg-${idx}`).attr('d', newLine(s.data));
                });
            });
        
        svg.call(zoom as never);

        // Add instructions
        svg.append('text')
            .attr('x', width - marginRight)
            .attr('y', height - 5)
            .attr('text-anchor', 'end')
            .style('font-size', '11px')
            .style('fill', '#666')
            .text('Scroll to zoom, drag to pan');
    };

    useEffect(() =>
    {
        if (!chartRef.current)
            return;

        if (isMultiSeries(chart))
        {
            renderMultiSeriesChart(chart);
        }
        else
        {
            renderSingleSeriesChart(chart);
        }
    }, [chart]);

    return (
        <div className="bg-white rounded-lg shadow-lg p-[10px] pb-[30px]">
            <div ref={chartRef}></div>
        </div>
    );
};

export default LineChart;