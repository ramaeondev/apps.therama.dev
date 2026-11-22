import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface ChartSeries {
  key: string;
  label: string;
  /** CSS custom property name, e.g. "var(--chart-1)". */
  color: string;
}

interface ChartFrameProps {
  title: string;
  description?: string;
  /** Data rows keyed by the `name` field used on the x axis. */
  data: Record<string, string | number>[];
  series: ChartSeries[];
  /** Rotate long labels (repository names). */
  rotatedLabels?: boolean;
  yLabel?: string;
  /** Optional value formatter for tooltips and the y axis. */
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
  height?: number;
  children?: ReactNode;
}

/**
 * The single chart surface used by both operational pages.
 *
 * Series colours come from the design tokens (`--chart-1..5`) instead of
 * hard-coded hex values, so charts follow the light/dark theme automatically.
 */
const ChartFrame = ({
  title,
  description,
  data,
  series,
  rotatedLabels = false,
  yLabel,
  valueFormatter,
  emptyMessage = 'No data to chart yet.',
  height = 320,
}: ChartFrameProps) => {
  const hasData = data.length > 0;

  return (
    <figure className="min-w-0">
      <figcaption className="mb-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
      </figcaption>

      {hasData ? (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: rotatedLabels ? 44 : 8 }}>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={rotatedLabels ? -30 : 0}
                textAnchor={rotatedLabels ? 'end' : 'middle'}
                interval={0}
                height={rotatedLabels ? 64 : 30}
                tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--line)' }}
              />
              <YAxis
                label={
                  yLabel
                    ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--ink-muted)' }
                    : undefined
                }
                tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
                width={yLabel ? 64 : 44}
              />
              <Tooltip
                cursor={{ fill: 'var(--surface-2)' }}
                formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  fontSize: 12,
                  color: 'var(--ink)',
                  boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.18)',
                }}
                labelStyle={{ color: 'var(--ink)', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: 'var(--ink-muted)' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--ink-muted)' }}
              />
              {series.map((entry) => (
                <Bar
                  key={entry.key}
                  dataKey={entry.key}
                  name={entry.label}
                  fill={entry.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-faint">
          {emptyMessage}
        </div>
      )}
    </figure>
  );
};

export default ChartFrame;
