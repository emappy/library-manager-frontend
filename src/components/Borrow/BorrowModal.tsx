import { useEffect, useState } from "react";
import axios from "axios";

type Book = { id: number; title: string };
type Member = { id: number; name: string };

export default function BorrowModal({ onClose }: { onClose: () => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bookId, setBookId] = useState<number | null>(null);
  const [memberId, setMemberId] = useState<number | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  // Pre-fill dates
  const [borrowDate, setBorrowDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    () =>
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/books`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setBooks)
      .catch((err) => console.error("Failed to load books", err));

    fetch(`${API_URL}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setMembers)
      .catch((err) => console.error("Failed to load members", err));
  }, [token]);

  const handleSubmit = () => {
    if (!bookId || !memberId || !dueDate) {
      alert("Please select a book, member, and valid due date.");
      return;
    }

    axios
      .post(
        `${API_URL}/borrow-records/borrow`,
        {
          book_id: bookId,
          member_id: memberId,
          due_date: dueDate, // send state variable as API field
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        alert("Book borrowed!");
        onClose();
      })
      .catch((err) => {
        console.error("Failed to borrow book", err);
        alert(
          "Borrow failed: " +
            (err.response?.data?.message?.[0] ?? "Unknown error")
        );
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Borrow Book</h2>
        <p className="text-gray-600">
          Select a book and member to create a new borrow record.
        </p>

        <div className="space-y-2">
          <label htmlFor="book-select" className="block font-medium">
            Select Book
          </label>
          <select
            id="book-select"
            value={bookId ?? ""}
            onChange={(e) => setBookId(Number(e.target.value))}
            className="border p-2 w-full rounded"
            aria-label="Select Book"
            title="Select Book"
          >
            <option value="">Choose a book to borrow</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>

          <label className="block font-medium">Select Member</label>
          <select
            value={memberId ?? ""}
            onChange={(e) => setMemberId(Number(e.target.value))}
            className="border p-2 w-full rounded"
            aria-label="Select Member"
            title="Select Member"
          >
            <option value="">Choose a member</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <label className="block font-medium mt-4">Borrow Date</label>
          <input
            type="date"
            value={borrowDate}
            onChange={(e) => setBorrowDate(e.target.value)}
            className="border p-2 w-full rounded"
            disabled // display only, not sent to API
          />

          <label className="block font-medium">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Borrow Book
          </button>
        </div>
      </div>
    </div>
  );
}
