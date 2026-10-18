
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import "./App.css";

interface Student {
  id: string;
  name: string;
  className: string;
  email: string;
}

type StudentForm = Omit<Student, "id">;

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<StudentForm>({
    name: "",
    className: "",
    email: ""
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStudents() {
    try {
      setError("");
      const response = await fetch("/api/students");

      if (!response.ok) throw new Error("Failed to load students");

      const data: Student[] = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingId
        ? `/api/students/${editingId}`
        : "/api/students";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error("Failed to save student");

      setForm({ name: "", className: "", email: "" });
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(student: Student) {
    setForm({
      name: student.name,
      className: student.className,
      email: student.email
    });
    setEditingId(student.id);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this student?")) return;

    try {
      setError("");
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete student");

      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="container">
      <h1>Student Management System</h1>
      <p>React + TypeScript + Azure Functions</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>{editingId ? "Edit Student" : "Add Student"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Student Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="className"
          placeholder="Class"
          value={form.className}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : editingId ? "Update" : "Add Student"}
        </button>

        {editingId !== null && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setForm({ name: "", className: "", email: "" });
          }}>
            Cancel
          </button>
        )}
      </form>

      <h2>Student List ({students.length})</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.className}</td>
              <td>{student.email}</td>
              <td>
                <button onClick={() => handleEdit(student)}>
                  Edit
                </button>
                <button
                  className="delete"
                  onClick={() => void handleDelete(student.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={4}>No students found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
