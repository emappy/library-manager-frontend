import { useEffect, useState } from "react";
import axios from "axios";

type Genre = { id: number; name: string };

export default function Genres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3000/genres", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGenres(res.data))
      .catch((err) => console.error("Failed to fetch genres", err));
  }, [token]);

  const filtered = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (genre: Genre) => {
    setEditingId(genre.id);
    setName(genre.name);
    setShowFormModal(true);
  };

  const startAdd = () => {
    setEditingId(null);
    setName("");
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await axios.patch(
          `http://localhost:3000/genres/${editingId}`,
          { name },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGenres((prev) =>
          prev.map((g) => (g.id === editingId ? { ...g, name } : g))
        );
      } else {
        const res = await axios.post(
          "http://localhost:3000/genres",
          { name },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const created = res.data as Genre;
        setGenres((prev) => [created, ...prev]);
      }

      setShowFormModal(false);
      setEditingId(null);
      setName("");
    } catch (err) {
      console.error("Failed to save genre", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this genre?")) return;
    try {
      await axios.delete(`http://localhost:3000/genres/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to delete genre", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Genres</h1>
          <p className="text-gray-600">Manage book genres (Admin Only)</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Genre
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search genres..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* Genre List */}
      <ul className="space-y-4">
        {filtered.map((g) => (
          <li
            key={g.id}
            className="border p-4 rounded shadow flex justify-between items-center"
          >
            <span className="font-medium">{g.name}</span>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(g)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(g.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
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
              {editingId ? "Edit Genre" : "Add Genre"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Genre name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
    </div>
  );
}
