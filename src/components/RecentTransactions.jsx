import { Download } from 'lucide-react';

const transactions = [
  { id: '#ORD-9921', customer: 'Sophia Henderson', date: 'May 24, 2024', status: 'COMPLETED', total: 'R$ 289,90' },
  { id: '#ORD-9920', customer: 'Marcus Wright', date: 'May 24, 2024', status: 'PROCESSING', total: 'R$ 145,50' },
  { id: '#ORD-9919', customer: 'Elena Petrov', date: 'May 23, 2024', status: 'SHIPPED', total: 'R$ 512,00' },
];

export default function RecentTransactions() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg text-[#5D4037]">Transações Recentes</h3>
        <button className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-[#8D6E63] transition-colors">
          <Download size={14} /> EXPORTAR CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] text-gray-300 uppercase tracking-widest border-b border-gray-50">
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Total</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((tr) => (
              <tr key={tr.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-4 text-xs font-bold text-gray-700">{tr.id}</td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex-shrink-0 border border-white" />
                    <span className="text-xs font-medium text-gray-600">{tr.customer}</span>
                  </div>
                </td>
                <td className="py-4 text-[11px] text-gray-400">{tr.date}</td>
                <td className="py-4">
                  <StatusBadge status={tr.status} />
                </td>
                <td className="py-4 text-xs font-bold text-right text-gray-700">{tr.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    PROCESSING: "bg-orange-50 text-orange-600 border-orange-100",
    SHIPPED: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}