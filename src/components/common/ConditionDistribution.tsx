import { SquareArrowOutUpRight } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ConditionDistribution({ total, data }: any) {
    const router = useRouter()

    const onClickHandler = () => {
        router.push('/patients')
    }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-800 shadow-md">
        <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold mb-4">Patient Condition Distribution</h3>
      <button className="text-sm text-green-400 hover:underline" onClick={onClickHandler}>
        <SquareArrowOutUpRight className="w-4 h-4 text-gray-500" />
        </button></div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-2xl font-bold mt-2">{total} Total Patients</p>
      <div className="flex justify-center gap-6 mt-4">
        {data.map((entry: any) => (
          <div key={entry.label} className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-sm text-gray-300">{entry.label} ({entry.value?.toFixed(2)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
