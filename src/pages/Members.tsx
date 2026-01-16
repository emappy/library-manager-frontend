import { useEffect, useState } from "react";
import axios from "axios";

type Member = {
  id: number;
  name: string;
  email: string;
  phone: string;
  join_date: string;
  activeBorrows: number;
};

type BorrowingHistory = {
  id: number;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Member>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    join_date: "",
    activeBorrows: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const [viewMemberModal, setViewMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get<Member[]>(`${API_URL}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const membersWithBorrows = await Promise.all(
          res.data.map(async (member) => {
            const historyRes = await axios.get<BorrowingHistory[]>(
              `${API_URL}/members/${member.id}/borrowing-history`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const history = Array.isArray(historyRes.data)
              ? historyRes.data
              : historyRes.data &&
                Array.isArray((historyRes.data as any).borrows)
              ? (historyRes.data as any).borrows
              : [];

            const activeBorrows = history.filter(
              (b: BorrowingHistory) => b.return_date === null
            ).length;

            return { ...member, activeBorrows };
          })
        );

        setMembers(membersWithBorrows);
      } catch (err) {
        console.error("Failed to fetch members", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [token, API_URL]);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading Members...</p>;
  }

  // Filtered list
  const filtered = members.filter((m) =>
    [m.name, m.email, m.phone, m.join_date]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(search.toLowerCase()))
  );

  // Handlers
  const startAdd = () => {
    setEditingId(null);
    setForm({
      id: 0,
      name: "",
      email: "",
      phone: "",
      join_date: "",
      activeBorrows: 0,
    });
    setShowFormModal(true);
  };

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setForm(member);
    setShowFormModal(true);
  };

  const viewMember = (member: Member) => {
    setSelectedMember(member);
    setViewMemberModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        // PATCH /members/{id}
        await axios.patch(
          `${API_URL}/members/${editingId}`,
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Optimistic update
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editingId
              ? {
                  ...m,
                  name: form.name,
                  email: form.email,
                  phone: form.phone,
                }
              : m
          )
        );
      } else {
        // POST /members
        const res = await axios.post(
          `${API_URL}/members`,
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
            join_date: new Date().toISOString(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const created = res.data as Member;
        // If backend returns only id, merge with form
        const newMember: Member = {
          id: created?.id ?? Math.random(),
          name: form.name,
          email: form.email,
          phone: form.phone,
          join_date: created?.join_date ?? new Date().toISOString(),
          activeBorrows: created?.activeBorrows ?? 0,
        };
        setMembers((prev) => [newMember, ...prev]);
      }

      setShowFormModal(false);
      setEditingId(null);
      setForm({
        id: 0,
        name: "",
        email: "",
        phone: "",
        join_date: "",
        // joined: new Date().toISOString(),
        activeBorrows: 0,
      });
    } catch (err) {
      console.error("Failed to save member", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this member?")) return;
    try {
      await axios.delete(`${API_URL}/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete member", err);
      alert("Unable to delete member. They may have related borrow records.");
    }
  };

  // Helpers
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-gray-600">Manage library members (Admin Only)</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Member
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* Member List */}
      <ul className="space-y-4">
        {filtered.map((m) => (
          <li
            key={m.id}
            className="border p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{m.name}</h2>
              <p className="text-gray-700">Email: {m.email}</p>
              <p className="text-gray-600">Phone: {m.phone}</p>
              <p className="text-gray-600">Joined: {m.join_date}</p>
              {/* <p className="text-gray-600">Joined: {formatDate(m.joined)}</p> */}
              <p className="text-gray-600">
                Active Borrows: {m.activeBorrows ?? 0}
              </p>
              <p className="text-gray-600">
                Status:{" "}
                {(m.activeBorrows ?? 0) > 0
                  ? `${m.activeBorrows} active`
                  : "none"}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => viewMember(m)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                View
              </button>

              <button
                onClick={() => startEdit(m)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Add/Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Member" : "Add Member"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <input
                name="email"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${
                    loading ? "bg-blue-300" : "bg-blue-600"
                  }`}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Member Modal */}
      {viewMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Member Details</h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedMember.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedMember.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedMember.phone}
              </p>
              <p>
                <strong>Joined:</strong> {formatDate(selectedMember.join_date)}
              </p>
              <p>
                <strong>Active Borrows:</strong>{" "}
                {selectedMember.activeBorrows ?? 0}
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setViewMemberModal(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
