import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', vendas: 4000 },
  { name: 'Ter', vendas: 3000 },
  { name: 'Qua', vendas: 2000 },
  { name: 'Qui', vendas: 2780 },
  { name: 'Sex', vendas: 1890 },
  { name: 'Sáb', vendas: 2390 },
  { name: 'Dom', vendas: 3490 },
];

export default function SalesChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 w-full h-[300px]">
      <h3 className="text-[#5D4037] mb-4 font-bold">Vendas por Dia da Semana</h3>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E5F5" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#FDF2F8' }} 
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar 
            dataKey="vendas" 
            fill="#F8BBD0" 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}