import { useEffect, useState } from "react";
import axios from "axios";
import BorrowCard from "../components/Borrow/BorrowCard";
import BorrowModal from "../components/Borrow/BorrowModal";
import ReturnModal from "../components/Borrow/ReturnModal";

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

export default function BorrowReturn() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch borrow records
  useEffect(() => {
    axios
      .get("http://localhost:3000/borrow-records", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const mapped = res.data.map((r: any) => {
          const status = r.return_date
            ? "RETURNED"
            : new Date(r.due_date) < new Date()
            ? "OVERDUE"
            : "ACTIVE";

          return {
            id: r.id,
            book: r.book,
            borrower: r.member.name,
            borrowed: r.borrow_date,
            due: r.due_date,
            returned: r.return_date,
            status,
          };
        });
        setBorrows(mapped);
      })
      .catch((err) => console.error("Failed to fetch borrows", err));
  }, [token]);

  // Handle inline return
  const handleReturn = (id: number) => {
    axios
      .post(
        "http://localhost:3000/borrow-records/return",
        { borrow_record_id: id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const updated = res.data;
        setBorrows((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  returned: updated.return_date,
                  status: "RETURNED",
                }
              : b
          )
        );
      })
      .catch((err) => console.error("Failed to return book", err));
  };

  // Handle borrow from modal
  const handleBorrow = (form: { book_id: number; member_id: number; due_date: string }) => {
    axios
      .post("http://localhost:3000/borrow-records/borrow", form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const r = res.data;
        const status = r.return_date
          ? "RETURNED"
          : new Date(r.due_date) < new Date()
          ? "OVERDUE"
          : "ACTIVE";

        const mapped: Borrow = {
          id: r.id,
          book: r.book,
          borrower: r.member.name,
          borrowed: r.borrow_date,
          due: r.due_date,
          returned: r.return_date,
          status,
        };

        alert("Book borrowed!");
        setBorrows((prev) => [...prev, mapped]);
        setShowBorrowModal(false);
      })
      .catch((err) => console.error("Failed to borrow book", err));
  };

  // Handle return from modal
  const handleReturnFromModal = (id: number) => {
    axios
      .post(
        "http://localhost:3000/borrow-records/return",
        { borrow_record_id: id }, // 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const updated = res.data;
        setBorrows((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  returned: updated.return_date,
                  status: "RETURNED",
                }
              : b
          )
        );
        setShowReturnModal(false);
      })
      .catch((err) => console.error("Failed to return book", err));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Borrow & Return</h2>
          <p className="text-gray-600">
            Manage book borrowing and return operations
          </p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setShowBorrowModal(true)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Borrow Book
          </button>
          <button
            onClick={() => setShowReturnModal(true)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Return Book
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {borrows.map((borrow) => (
          <BorrowCard key={borrow.id} borrow={borrow} onReturn={handleReturn} />
        ))}
      </div>

      {showBorrowModal && (
        <BorrowModal
          onClose={() => setShowBorrowModal(false)}
          onBorrow={handleBorrow}
        />
      )}
      {showReturnModal && (
        <ReturnModal
          onClose={() => setShowReturnModal(false)}
          activeBorrows={borrows.filter((b) => b.status === "ACTIVE")}
          onReturn={handleReturnFromModal}
        />
      )}
    </div>
  );
}
