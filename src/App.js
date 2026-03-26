import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [taskCategory, setTaskCategory] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [allCategories, setAllCategories] = useState(["All"]);
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setTasks(data || []);
    const categories = ["All", ...new Set((data || []).map(t => t.category))];
    setAllCategories(categories);
  }

  async function addTask() {
    if (!newTask.trim()) return;

    const category = taskCategory.trim() || "General";

    await supabase.from("tasks").insert([{
      title: newTask,
      completed: false,
      category,
      priority: taskPriority,
      due_date: taskDueDate || null
    }]);

    setNewTask("");
    setTaskCategory("");
    setTaskPriority("Medium");
    setTaskDueDate("");
    fetchTasks();
  }

  async function toggleComplete(id, completed) {
    await supabase
      .from("tasks")
      .update({ completed: !completed })
      .eq("id", id);

    fetchTasks();
  }

  async function deleteTask(id) {
    await supabase.from("tasks").delete().eq("id", id);
    fetchTasks();
  }

  function isOverdue(due_date, completed) {
    if (!due_date || completed) return false;

    const today = new Date();
    const taskDate = new Date(due_date);

    today.setHours(0,0,0,0);
    taskDate.setHours(0,0,0,0);

    return taskDate < today;
  }

  const filteredTasks =
    filterCategory === "All"
      ? tasks
      : tasks.filter(t => t.category === filterCategory);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const order = { High: 3, Medium: 2, Low: 1 };
      return order[b.priority] - order[a.priority];
    }
    if (sortBy === "date") {
      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
    }
    return 0;
  });

  const filteredCategories = allCategories.filter(c =>
    c.toLowerCase().includes(taskCategory.toLowerCase())
  );

  return (
    <div className="app">
      <div className="card">

        <h1 className="title">TaskFlow</h1>

        {/* Filters */}
        <div className="controls">
          <div className="filters">
            {allCategories.map(cat => (
              <button
                key={cat}
                className={`chip ${filterCategory === cat ? "active" : ""}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort">
            <button onClick={() => setSortBy("date")}>Date</button>
            <button onClick={() => setSortBy("priority")}>Priority</button>
          </div>
        </div>

        {/* Add Task */}
        <div className="add-task">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />

          <div className="autocomplete">
            <input
              type="text"
              placeholder="Category"
              value={taskCategory}
              onChange={e => setTaskCategory(e.target.value)}
            />
            {taskCategory && (
              <ul>
                {filteredCategories.map(cat => (
                  <li key={cat} onClick={() => setTaskCategory(cat)}>
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select
            value={taskPriority}
            onChange={e => setTaskPriority(e.target.value)}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input
            type="date"
            value={taskDueDate}
            onChange={e => setTaskDueDate(e.target.value)}
          />

          <button className="add-btn" onClick={addTask}>
            Add
          </button>
        </div>

        {/* Tasks */}
        <ul className="task-list">
          {sortedTasks.map(task => (
            <li
              key={task.id}
              className={`task ${task.completed ? "done" : ""} ${
                isOverdue(task.due_date, task.completed) ? "overdue" : ""
              }`}
            >
              <div className="left">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id, task.completed)}
                />
                <span className="text">{task.title}</span>
              </div>

              <div className="right">
                <span className={`badge ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>

                {task.due_date && (
                  <span className="date">{task.due_date}</span>
                )}

                <span className="badge category">
                  {task.category}
                </span>

                <button className="delete" onClick={() => deleteTask(task.id)}>
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}

export default App;