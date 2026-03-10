import React from 'react';
import { Eye } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

const RentalsTable = ({ rentals = [], loading }) => {
  if (loading) {
    return <div className="loading-spinner">جاري التحميل...</div>;
  }

  return (
    <table className="rentals-table">
      <thead>
        <tr>
          <th>#</th>
          <th>العميل</th>
          <th>الألعاب</th>
          <th>المدة</th>
          <th>المبلغ</th>
          <th>الحالة</th>
          <th>طريقة الدفع</th>
          <th>التاريخ</th>
        </tr>
      </thead>
      <tbody>
        {rentals.map(rental => (
          <tr key={rental.id}>
            <td>#{rental.rental_number || rental.id}</td>
            <td>{rental.customer_name}</td>
            <td>{rental.items?.map(item => item.game_name).join(', ')}</td>
            <td>{rental.duration_minutes || 15} د</td>
            <td>{formatCurrency(rental.final_amount || rental.total_amount || 0)}</td>
            <td>
              <span className={`status-badge ${rental.status}`}>
                {rental.status === 'active' ? 'نشط' :
                 rental.status === 'completed' ? 'مكتمل' :
                 rental.status === 'cancelled' ? 'ملغي' : rental.status}
              </span>
            </td>
            <td>
              {rental.payment_method === 'cash' ? 'نقدي' :
               rental.payment_method === 'card' ? 'بطاقة' :
               rental.payment_method === 'wallet' ? 'محفظة' : '-'}
            </td>
            <td>{formatDateTime(rental.start_time)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RentalsTable;