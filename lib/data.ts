type TimeSeriesDatum = {
    x: number;
    y: number;
};

export function objectToTimeSeriesArray(obj: Record<number, number>): TimeSeriesDatum[] {
    return Object.entries(obj).map(([x, y]) => ({
        x: Number(x),
        y,
    }));
}
