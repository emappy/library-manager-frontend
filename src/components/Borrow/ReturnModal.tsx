import { useState } from "react";
import axios from "axios";

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

export default function ReturnModal({
  onClose,
  activeBorrows,
  onReturn,
}: {
  onClose: () => void;
  activeBorrows: Borrow[];
  onReturn: (id: number, returnDate: string) => void;
}) {
  const [selectedBorrowId, setSelectedBorrowId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowId) return;

    try {
      const res = await axios.post(
        "http://localhost:3000/borrow-records/return",
        { borrow_record_id: selectedBorrowId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Book returned!");
      onReturn(res.data.id, res.data.return_date);
      onClose();
    } catch (err) {
      console.error("Failed to return book", err);
      alert(
        ("Return failed: " + ((err as any).response?.data?.message ?? "Unknown error"))
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Return Book</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="borrow-select" className="block font-medium mb-1">
            Select Borrow
          </label>
          <select
            id="borrow-select"
            title="Select Borrow"
            value={selectedBorrowId ?? ""}
            onChange={(e) => setSelectedBorrowId(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Borrow</option>
            {activeBorrows.map((b) => (
              <option key={b.id} value={b.id}>
                {b.book.title} — {b.borrower}
              </option>
            ))}
          </select>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
