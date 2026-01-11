import { useEffect, useState } from "react";
import axios from "axios";

type BorrowRecord = {
  book: { title: string };
  member: { name: string };
  due_date: string;
  return_date?: string;
  borrow_date: string;
};

type GenreStat = { name: string; count: number };

export default function Reports() {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [monthlyBorrows, setMonthlyBorrows] = useState<number>(0);
  const [borrowDurationAvg, setBorrowDurationAvg] = useState<number>(0);
  const [returnRate, setReturnRate] = useState<number>(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:3000/borrow-records", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setBorrows(data);

        // Popular genres
        const genreMap: Record<string, number> = {};
        data.forEach((r: any) => {
          const genre = r.book.genre.name;
          genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
        const sortedGenres = Object.entries(genreMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setGenres(sortedGenres.slice(0, 5));

        // Monthly borrows
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthly = data.filter((r: any) => {
          const d = new Date(r.borrow_date);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        });
        setMonthlyBorrows(monthly.length);

        // Average borrow duration
        const durations = data
          .filter((r: any) => r.return_date)
          .map((r: any) => {
            const start = new Date(r.borrow_date);
            const end = new Date(r.return_date);
            return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          });
        const avg = durations.length
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;
        setBorrowDurationAvg(Number(avg.toFixed(1)));

        // Return rate
        const returned = data.filter((r: any) => r.return_date).length;
        const rate = data.length ? (returned / data.length) * 100 : 0;
        setReturnRate(Number(rate.toFixed(1)));
      } catch (err) {
        console.error("Failed to fetch reports", err);
      }
    };

    fetchReports();
  }, [token]);

  const overdueBooks = borrows.filter(
    (r) => !r.return_date && new Date(r.due_date) < new Date()
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-gray-600">Library analytics and reports</p>

      {/* Overdue Books */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Overdue Books</h2>
        {overdueBooks.length === 0 ? (
          <p className="text-gray-500">No overdue books</p>
        ) : (
          <ul className="space-y-2">
            {overdueBooks.map((r, i) => {
              const days = Math.floor(
                (new Date().getTime() - new Date(r.due_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <li key={i} className="border p-3 rounded bg-white shadow">
                  <strong>{r.book.title}</strong> — {r.member.name}
                  <br />
                  Due: {r.due_date}
                  <span className="text-red-600 font-semibold">
                    {" "}
                    [{days} days overdue]
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Popular Genres */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Popular Genres</h2>
        <ul className="list-disc pl-6 text-gray-700">
          {genres.map((g, i) => (
            <li key={i}>
              <strong>#{i + 1}</strong> {g.name} — {g.count}
            </li>
          ))}
        </ul>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold">Total Borrows This Month</h3>
          <p className="text-3xl font-bold">{monthlyBorrows}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold">Average Borrow Duration</h3>
          <p className="text-3xl font-bold">{borrowDurationAvg} days</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold">Return Rate</h3>
          <p className="text-3xl font-bold">{returnRate}%</p>
        </div>
      </div>
    </div>
  );
}
