
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getStats } from "../api/stats";
import StatCard from "../components/Dashboard/StatCard";
import QuickActions from "../components/Dashboard/QuickActions";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch {
        setError("Failed to load stats.");
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your library efficiently with quick access to books, members,
          and borrow records.
        </p>
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => navigate("/")} className="nav-card">
          Dashboard
        </button>
        <button onClick={() => navigate("/books")} className="nav-card">
          Books
        </button>
        <button onClick={() => navigate("/members")} className="nav-card">
          Members
        </button>
        <button onClick={() => navigate("/borrows")} className="nav-card">
          Borrows
        </button>
      </div>

      {/* Stats Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Library Overview</h2>
        {error && <div className="text-red-600">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total books" value={stats?.totalBooks ?? 0} />
          <StatCard label="Total members" value={stats?.totalMembers ?? 0} />
          <StatCard label="Active borrows" value={stats?.activeBorrows ?? 0} />
          <StatCard label="Overdue books" value={stats?.overdueBooks ?? 0} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
}
