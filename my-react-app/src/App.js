import React, { useState, useEffect } from "react";
import { getTasks, updateTask, deleteTask } from "./api/tasks";
import CreateTask from "./CreateTask";

function App() {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleTaskCreated = (newTask) => {
        setTasks((prev) => [...prev, newTask]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(id);
            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (error) {
            alert("Failed to delete task: " + error.message);
        }
    };

    const handleEditClick = (task) => {
        setEditingTask(task);
    };

    const handleEditCancel = () => {
        setEditingTask(null);
    };

    const handleEditSave = async (updatedTask) => {
        try {
            const savedTask = await updateTask(updatedTask.id, updatedTask);
            setTasks((prev) =>
                prev.map((task) => (task.id === savedTask.id ? savedTask : task))
            );
            setEditingTask(null);
        } catch (error) {
            alert("Failed to update task: " + error.message);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
            <h1>Task Tracker</h1>
            <CreateTask onTaskCreated={handleTaskCreated} />
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {tasks.map((task) =>
                    editingTask && editingTask.id === task.id ? (
                        <EditTaskForm
                            key={task.id}
                            task={editingTask}
                            onCancel={handleEditCancel}
                            onSave={handleEditSave}
                        />
                    ) : (
                        <li
                            key={task.id}
                            style={{
                                marginBottom: 10,
                                padding: 10,
                                border: "1px solid #ccc",
                                borderRadius: 4,
                            }}
                        >
                            <strong>{task.title}</strong> - {task.description} (Assigned to:{" "}
                            {task.assignedTo})
                            <div style={{ marginTop: 5 }}>
                                <button onClick={() => handleEditClick(task)} style={{ marginRight: 8 }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(task.id)}>Delete</button>
                            </div>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}

function EditTaskForm({ task, onCancel, onSave }) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [assignedTo, setAssignedTo] = useState(task.assignedTo);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave({ ...task, title, description, assignedTo });
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            <input
                type="text"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <input
                type="text"
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <button type="submit" disabled={loading} style={{ marginRight: 8 }}>
                {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onCancel} disabled={loading}>
                Cancel
            </button>
        </form>
    );
}

export default App;
