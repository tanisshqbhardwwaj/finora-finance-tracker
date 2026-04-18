const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatINR = (value: number | string | null | undefined) => {
  const amount = typeof value === 'string' ? Number(value) : value;
  const safeAmount = Number.isFinite(amount ?? NaN) ? (amount as number) : 0;
  return inrFormatter.format(safeAmount);
};