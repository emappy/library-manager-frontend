import { useEffect, useState } from "react";
import axios from "axios";

type Genre = { id: number; name: string };
type Book = {
  id: number;
  title: string;
  author: string;
  published_year: number;
  available_copies: number;
  genre_id: number;
  genre: Genre;
};

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Book>({
    id: 0,
    title: "",
    author: "",
    published_year: new Date().getFullYear(),
    available_copies: 1,
    genre_id: 0,
    genre: { id: 0, name: "" },
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewBook, setViewBook] = useState<Book | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch books + genres
  useEffect(() => {
    axios
      .get("http://localhost:3000/books", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("Failed to fetch books", err));

    axios
      .get("http://localhost:3000/genres", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGenres(res.data))
      .catch((err) => console.error("Failed to fetch genres", err));
  }, [token]);

  // Search filter
  const filtered = books.filter((b) =>
    [b.title, b.author, b.genre.name].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this book?")) return;
    try {
      await axios.delete(`http://localhost:3000/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Book deleted!");
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete book", err);
    }
  };

  // Form change handler (keep numeric parsing)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "published_year" ||
        name === "available_copies" ||
        name === "genre_id"
          ? Number(value)
          : value,
    });
  };

  // Add / Edit submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        author: form.author,
        published_year: Number(form.published_year),
        available_copies: Number(form.available_copies),
        genre_id: Number(form.genre_id),
      };

      if (editingId) {
        // PATCH per Swagger
        const res = await axios.patch(
          `http://localhost:3000/books/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update local state without reload
        setBooks((prev) =>
          prev.map((b) => (b.id === editingId ? res.data : b))
        );
        alert("Book updated!");
      } else {
        const res = await axios.post("http://localhost:3000/books", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks((prev) => [...prev, res.data]);
        alert("Book added!");
      }

      setShowFormModal(false);
    } catch (err) {
      console.error("Failed to save book", err);
      alert("Save failed");
    }
  };

  // Helpers (ensure genre_id is set when editing)
  const startEdit = (book: Book) => {
    setEditingId(book.id);
    setForm({
      ...book,
      genre_id: book.genre.id, // align with API
    });
    setShowFormModal(true);
  };

  const startView = (book: Book) => setViewBook(book);

  const startAdd = () => {
    setEditingId(null);
    setForm({
      id: 0,
      title: "",
      author: "",
      published_year: new Date().getFullYear(),
      available_copies: 1,
      genre_id: 0,
      genre: { id: 0, name: "" },
    });
    setShowFormModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Books</h1>
          <p className="text-gray-600">Manage library books</p>
        </div>
        <button
          onClick={startAdd}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Add Book
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search books by title, author, or genre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* Book List */}
      <ul className="space-y-4">
        {filtered.map((book) => (
          <li
            key={book.id}
            className="border p-4 rounded shadow flex justify-between items-center bg-white"
          >
            <div>
              <h2 className="text-lg font-semibold">{book.title}</h2>
              <p className="text-gray-700">Author: {book.author}</p>
              <p className="text-gray-700">Genre: {book.genre.name}</p>
              <p className="text-gray-600">Published: {book.published_year}</p>
              <p className="text-gray-600">
                Available Copies: {book.available_copies}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startView(book)}
                className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
              >
                View
              </button>
              <button
                onClick={() => startEdit(book)}
                className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(book.id)}
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
              {editingId ? "Edit Book" : "Add Book"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <input
                name="author"
                placeholder="Author"
                value={form.author}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <input
                name="published_year"
                type="number"
                placeholder="Published Year"
                value={form.published_year}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <input
                name="available_copies"
                type="number"
                placeholder="Available Copies"
                value={form.available_copies}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              />
              <select
                name="genre_id"
                value={form.genre_id}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Genre</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Book Details</h2>
            <div className="space-y-2">
              <p>
                <strong>Title:</strong> {viewBook.title}
              </p>
              <p>
                <strong>Author:</strong> {viewBook.author}
              </p>
              <p>
                <strong>Genre:</strong> {viewBook.genre?.name}
              </p>
              <p>
                <strong>Published:</strong> {viewBook.published_year}
              </p>
              <p>
                <strong>Available Copies:</strong> {viewBook.available_copies}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewBook(null)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
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
