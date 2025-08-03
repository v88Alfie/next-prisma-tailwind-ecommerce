'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface OrderChartProps {
   data: any[]
}

export const OrderChart: React.FC<OrderChartProps> = ({ data }) => {
   return (
      <ResponsiveContainer width="100%" height={350}>
         <BarChart data={data}>
            <XAxis
               dataKey="date"
               stroke="#888888"
               fontSize={12}
               tickLine={false}
               axisLine={false}
            />
            <YAxis
               stroke="#888888"
               fontSize={12}
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => `${value}`}
            />
            <Bar dataKey="orderCount" fill="#3498db" radius={[4, 4, 0, 0]} />
         </BarChart>
      </ResponsiveContainer>
   )
}