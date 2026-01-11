// src/components/Dashboard/StatCard.tsx
type Props = { label: string; value: number };
export default function StatCard({ label, value }: Props) {
  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
