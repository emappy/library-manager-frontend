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

  const [activeBorrowsList, setActiveBorrowsList] = useState<any[]>([]);

  // Modal toggles
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, membersRes, borrowsRes] = await Promise.all([
          axios.get(`${API_URL}/books`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/members`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/borrow-records`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const books = Array.isArray(booksRes.data)
          ? booksRes.data
          : booksRes.data?.books ?? [];

        const members = Array.isArray(membersRes.data)
          ? membersRes.data
          : membersRes.data?.members ?? [];

        const borrows = Array.isArray(borrowsRes.data)
          ? borrowsRes.data
          : borrowsRes.data?.borrows ?? [];

        const activeBorrowsArray = borrows.filter((b: any) => !b.return_date);
        const overdueBorrows = activeBorrowsArray.filter(
          (b: any) => new Date(b.due_date) < new Date()
        );

        setActiveBorrowsList(activeBorrowsArray);

        setStats({
          totalBooks: books.length,
          totalMembers: members.length,
          activeBorrows: activeBorrowsArray.length,
          overdueBorrows: overdueBorrows.length,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, API_URL]);

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

      {/* Modals */}
      {showBorrowModal && (
        <BorrowModal onClose={() => setShowBorrowModal(false)} />
      )}
      {showReturnModal && (
        <ReturnModal
          onClose={() => setShowReturnModal(false)}
          activeBorrows={activeBorrowsList}
          onReturn={() => {
            setShowReturnModal(false);
          }}
        />
      )}
    </div>
  );
}
