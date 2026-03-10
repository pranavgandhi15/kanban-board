import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";

const COLUMNS = ["Todo", "In Progress", "Done"];

const initialTasks = {
  Todo: [],
  "In Progress": [],
  Done: [],
};

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      desc: newTaskDesc,
    };
    setTasks((prev) => ({
      ...prev,
      Todo: [...prev.Todo, task],
    }));
    setNewTaskTitle("");
    setNewTaskDesc("");
  };

  const deleteTask = (col, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [col]: prev[col].filter((t) => t.id !== taskId),
    }));
  };

  const saveEdit = () => {
    const { col, id, title, desc } = editingTask;
    setTasks((prev) => ({
      ...prev,
      [col]: prev[col].map((t) => (t.id === id ? { ...t, title, desc } : t)),
    }));
    setEditingTask(null);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...tasks[source.droppableId]];
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...tasks[destination.droppableId]];
    const [moved] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, moved);

    setTasks((prev) => ({
      ...prev,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    }));
  };

  const colColors = { Todo: "#4f8ef7", "In Progress": "#f7a94f", Done: "#4fcf7a" };

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "24px", color: "#333" }}>
        📋 Kanban Board
      </h1>

      {/* Add Task Form */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", justifyContent: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Task title *"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Description (optional)"
          value={newTaskDesc}
          onChange={(e) => setNewTaskDesc(e.target.value)}
          style={inputStyle}
        />
        <button onClick={addTask} style={btnStyle("#4f8ef7")}>
          + Add Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          {COLUMNS.map((col) => (
            <div key={col} style={{ background: "#fff", borderRadius: "12px", padding: "16px", width: "280px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <h2 style={{ color: colColors[col], marginBottom: "12px", borderBottom: `3px solid ${colColors[col]}`, paddingBottom: "8px" }}>
                {col} ({tasks[col].length})
              </h2>
              <Droppable droppableId={col}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: "100px" }}>
                    {tasks[col].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ background: "#f8f9fa", borderRadius: "8px", padding: "12px", marginBottom: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", ...provided.draggableProps.style }}
                          >
                            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{task.title}</p>
                            {task.desc && <p style={{ fontSize: "13px", color: "#666" }}>{task.desc}</p>}
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                              <button onClick={() => setEditingTask({ col, ...task })} style={btnStyle("#f7a94f", "small")}>Edit</button>
                              <button onClick={() => deleteTask(col, task.id)} style={btnStyle("#ff5c5c", "small")}>Delete</button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Edit Modal */}
      {editingTask && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "320px" }}>
            <h3 style={{ marginBottom: "16px" }}>Edit Task</h3>
            <input
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              style={{ ...inputStyle, display: "block", width: "100%", marginBottom: "10px" }}
            />
            <input
              value={editingTask.desc}
              onChange={(e) => setEditingTask({ ...editingTask, desc: e.target.value })}
              style={{ ...inputStyle, display: "block", width: "100%", marginBottom: "16px" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={saveEdit} style={btnStyle("#4f8ef7")}>Save</button>
              <button onClick={() => setEditingTask(null)} style={btnStyle("#aaa")}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px",
  outline: "none",
  width: "300px",
};

const btnStyle = (color, size) => ({
  background: color,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: size === "small" ? "4px 10px" : "10px 20px",
  fontSize: size === "small" ? "12px" : "14px",
  cursor: "pointer",
});