import { formatINR } from '../utils/currency';

interface BudgetCardProps {
  limit: number;
  spent: number;
  remaining: number;
  exceeded: boolean;
  percentage: number;
}

const BudgetCard = ({ limit, spent, remaining, exceeded, percentage }: BudgetCardProps) => {
  const barColor = exceeded
    ? 'bg-red-500'
    : percentage >= 80
    ? 'bg-yellow-500'
    : 'bg-green-500';

  return (
    <div className={`rounded-xl p-5 ${exceeded ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">Monthly Budget</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${exceeded ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {exceeded ? '⚠️ Over Budget' : '✅ On Track'}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className={`h-3 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>Spent: <strong className="text-gray-800">{formatINR(spent)}</strong></span>
        <span>Limit: <strong className="text-gray-800">{formatINR(limit)}</strong></span>
      </div>

      <p className={`text-sm mt-2 ${exceeded ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
        {exceeded
          ? `⚠️ You've exceeded your budget by ${formatINR(Math.abs(remaining))}`
          : `${formatINR(remaining)} remaining (${percentage}% used)`}
      </p>
    </div>
  );
};

export default BudgetCard;
