import { useEffect, useState } from "react";
import axios from "axios";

type Staff = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export default function Staff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<Partial<Staff>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch staff
  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStaff(res.data.users))
      .catch((err) => console.error("Failed to fetch staff", err));
  }, [token]);

  const filteredStaff = staff.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const startAdd = () => {
    setEditingId(null);
    setForm({});
    setShowFormModal(true);
  };

  const startEdit = (user: Staff) => {
    setEditingId(user.id);
    setForm(user);
    setShowFormModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this staff member?")) return;

    try {
      await axios.delete(`http://localhost:3000/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff((prev) => prev.filter((s) => s.id !== id));
      alert("Staff deleted!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        "Delete failed: " + (err as any).response?.data?.message ??
          "Unknown error"
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.role) return;

    if (!editingId && form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      if (editingId) {
        const res = await axios.patch(
          `http://localhost:3000/staff/${editingId}`,
          {
            username: form.username,
            email: form.email,
            role: form.role,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStaff((prev) =>
          prev.map((s) => (s.id === editingId ? res.data : s))
        );
        alert("Staff updated!");
      } else {
        const res = await axios.post(
          "http://localhost:3000/staff",
          {
            username: form.username,
            email: form.email,
            password: form.password,
            role: form.role,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStaff((prev) => [...prev, res.data]);
        alert("Staff added!");
      }

      setShowFormModal(false);
    } catch (err) {
      console.error("Failed to save staff", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-gray-600">Manage system users</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Add Staff
        </button>
      </div>

      <input
        type="text"
        placeholder="Search staff..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 w-full rounded mb-4"
      />

      <ul className="space-y-4">
        {filteredStaff.map((user) => (
          <li
            key={user.id}
            className="border p-4 rounded shadow flex justify-between items-center bg-white"
          >
            <div>
              <h2 className="text-lg font-semibold">{user.username}</h2>
              <p className="text-gray-700">Email: {user.email}</p>
              <p className="text-gray-600">Role: {user.role}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(user)}
                className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="bg-white border px-3 py-1 rounded hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ul className="space-y-4">
        {staff.map((user) => (
          <li
            key={user.id}
            className="border p-4 rounded shadow flex justify-between items-center bg-white"
          >
            <div>
              <h2 className="text-lg font-semibold">{user.username}</h2>
              <p className="text-gray-700">Email: {user.email}</p>
              <p className="text-gray-600">Role: {user.role}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(user)}
                className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="bg-white border px-3 py-1 rounded hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Staff" : "Add Staff"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="username"
                placeholder="Username"
                value={form.username ?? ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email ?? ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <select
                name="role"
                value={form.role ?? ""}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              >
                <option value="">Select Role</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
              {!editingId && (
                <>
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password ?? ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    required
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={form.confirmPassword ?? ""}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    required
                  />
                </>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-white border px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  {editingId ? "Update Staff" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
