import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function BetterAreaChartWithUpload() {
  const [chartData, setChartData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setChartData(result.data.filter(row => row.name));
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2">
          Upload Revenue CSV
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-2 text-sm text-gray-500">Expected columns: name, uv, pv</p>
      </div>

      {chartData.length > 0 && (
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="uv"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorUv)"
              />
              <Area
                type="monotone"
                dataKey="pv"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorPv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
