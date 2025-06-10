'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const data = [
  { name: 'Mon', classes: 4, attendance: 45 },
  { name: 'Tue', classes: 6, attendance: 78 },
  { name: 'Wed', classes: 8, attendance: 85 },
  { name: 'Thu', classes: 7, attendance: 70 },
  { name: 'Fri', classes: 5, attendance: 55 },
  { name: 'Sat', classes: 10, attendance: 90 },
  { name: 'Sun', classes: 3, attendance: 40 },
];

export function Overview() {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select defaultValue={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid hsl(var(--border))' 
              }} 
            />
            <Legend />
            <Bar 
              dataKey="classes" 
              name="Classes" 
              fill="hsl(var(--chart-1))" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="attendance" 
              name="Attendance" 
              fill="hsl(var(--chart-2))" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}