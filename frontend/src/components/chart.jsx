import { PieChart, Pie, Cell } from "recharts";

export default function DonutChart({ invested, returns }) {
  const data = [
    { name: 'Invested', value: invested },
    { name: 'Returns', value: returns },
  ];
  const COLORS = ['#d0d7ff', '#415aff'];

  return (
    <PieChart width={200} height={200}>
      <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
        {data.map((entry, i) => (
          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
}
