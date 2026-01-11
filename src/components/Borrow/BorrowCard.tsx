type Borrow = {
  id: number;
  book: {
    id: number;
    title: string;
    author: string;
    published_year: number;
    available_copies: number;
    genre_id: number;
    genre: { id: number; name: string };
  };
  borrower: string;
  borrowed: string;
  due: string;
  returned?: string | null;
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
};

export default function BorrowCard({
  borrow,
  onReturn,
}: {
  borrow: Borrow;
  onReturn: (id: number) => void;
}) {
  const statusColor =
    borrow.status === "ACTIVE"
      ? "bg-green-100 text-green-800"
      : borrow.status === "RETURNED"
      ? "bg-blue-100 text-blue-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="border p-4 rounded shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{borrow.book.title}</h3>
        <span
          className={`px-2 py-1 text-sm rounded ${statusColor} font-medium`}
        >
          {borrow.status}
        </span>
      </div>

      <p className="text-gray-700">Author: {borrow.book.author}</p>
      <p className="text-gray-700">Genre: {borrow.book.genre.name}</p>
      <p className="text-gray-600">Borrower: {borrow.borrower}</p>
      <p className="text-gray-600">Borrowed: {borrow.borrowed}</p>
      <p className="text-gray-600">Due: {borrow.due}</p>
      {borrow.returned && (
        <p className="text-gray-600">Returned: {borrow.returned}</p>
      )}

      {borrow.status === "ACTIVE" && (
        <button
          onClick={() => onReturn(borrow.id)}
          className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Mark as Returned
        </button>
      )}
    </div>
  );
}
