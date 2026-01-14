import { useEffect, useState } from "react";
import axios from "axios";
import BorrowModal from "../components/Borrow/BorrowModal";
import ReturnModal from "../components/Borrow/ReturnModal";

type Stats = {
  totalBooks: number;
  totalMembers: number;
  activeBorrows: number;
  overdueBorrows: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalMembers: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal toggles
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, membersRes, borrowsRes] = await Promise.all([
          axios.get("http://localhost:3000/books", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/members", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/borrow-records", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const books = booksRes.data;
        const members = membersRes.data;
        const borrows = borrowsRes.data;

        const activeBorrows = borrows.filter((b: any) => !b.return_date).length;
        const overdueBorrows = borrows.filter(
          (b: any) => !b.return_date && new Date(b.due_date) < new Date()
        ).length;

        setStats({
          totalBooks: books.length,
          totalMembers: members.length,
          activeBorrows,
          overdueBorrows,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading dashboard...</p>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Overview of library activity</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Books</h2>
          <p className="text-3xl font-bold">{stats.totalBooks}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Members</h2>
          <p className="text-3xl font-bold">{stats.totalMembers}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Active Borrows</h2>
          <p className="text-3xl font-bold text-green-600">
            {stats.activeBorrows}
          </p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Overdue Borrows</h2>
          <p className="text-3xl font-bold text-red-600">
            {stats.overdueBorrows}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setShowBorrowModal(true)}
            className="bg-black text-white p-4 rounded shadow hover:bg-gray-800"
          >
            Borrow Book
          </button>
          <button
            onClick={() => setShowReturnModal(true)}
            className="bg-black text-white p-4 rounded shadow hover:bg-gray-800"
          >
            Return Book
          </button>
        </div>
      </div>

      {/* Modals / Pages */}
      {showBorrowModal && (
        <BorrowModal onClose={() => setShowBorrowModal(false)} />
      )}
      {showReturnModal && (
        <ReturnModal
          onClose={() => setShowReturnModal(false)}
          activeBorrows={[]}
          onReturn={() => {}}
        />
      )}
    </div>
  );
}
