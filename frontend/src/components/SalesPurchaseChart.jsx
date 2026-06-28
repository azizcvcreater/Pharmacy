import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export function SalesPurchaseChart({ data, type = 'bar' }) {
  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  return (
    <ResponsiveContainer width='100%' height={300}>
      <ChartComponent
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey={data[0]?.date ? 'date' : data[0]?.month ? 'month' : 'year'}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey='purchases' fill='#8884d8' name='Purchases' />
        <Bar dataKey='sales' fill='#82ca9d' name='Sales' />
        {/* For line chart, use Line instead of Bar */}
        {type === 'line' && (
          <>
            <Line
              type='monotone'
              dataKey='purchases'
              stroke='#8884d8'
              name='Purchases'
            />
            <Line
              type='monotone'
              dataKey='sales'
              stroke='#82ca9d'
              name='Sales'
            />
          </>
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
