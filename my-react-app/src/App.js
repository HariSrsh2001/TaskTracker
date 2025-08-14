import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getTasks, updateTask, deleteTask, updateStatus } from "./api/tasks";
import CreateTask from "./CreateTask";

function App() {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [loading, setLoading] = useState(true);

    const connectionRef = useRef(null);

    const statusMap = { New: 0, InProgress: 1, Completed: 2 };
    const reverseStatusMap = { 0: "New", 1: "InProgress", 2: "Completed" };

    useEffect(() => {
        fetchTasks();

        connectionRef.current = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5249/taskhub")
            .withAutomaticReconnect()
            .build();

        connectionRef.current
            .start()
            .then(() => console.log("SignalR connected"))
            .catch((err) => console.error("SignalR connection error: ", err));

        // SignalR handlers
        connectionRef.current.on("TaskCreated", (newTask) => {
            setTasks((prev) => {
                if (prev.some((task) => task.id === newTask.id)) return prev; // prevent duplicates
                return [...prev, newTask];
            });
        });

        connectionRef.current.on("TaskUpdated", (updatedTask) => {
            setTasks((prev) =>
                prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
            );
        });

        connectionRef.current.on("TaskDeleted", (deletedTaskId) => {
            setTasks((prev) => prev.filter((task) => task.id !== deletedTaskId));
        });

        return () => {
            connectionRef.current.stop();
        };
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            alert(error.message);
        }
        setLoading(false);
    };

    // Do NOT update local state here; SignalR will handle it
    const handleTaskCreated = (newTask) => {
        // Intentionally empty
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(id);
            // Don't call setTasks here — let SignalR's "TaskDeleted" event handle it
        } catch (error) {
            alert("Failed to delete task: " + error.message);
        }
    };


    //const handleDelete = async (id) => {
    //    if (!window.confirm("Are you sure you want to delete this task?")) return;
    //    try {
    //        await deleteTask(id);
    //        setTasks(prev => prev.filter(task => task.id !== id)); // remove instantly
    //    } catch (error) {
    //        alert("Failed to delete task: " + error.message);
    //    }
    //};

    const handleEditClick = (task) => setEditingTask(task);
    const handleEditCancel = () => setEditingTask(null);

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
            {loading ? (
                <div>Loading tasks...</div>
            ) : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {tasks.map((task) =>
                        editingTask && editingTask.id === task.id ? (
                            <EditTaskForm
                                key={`edit-${task.id}`} // unique key for edit form
                                task={editingTask}
                                onCancel={handleEditCancel}
                                onSave={handleEditSave}
                            />
                        ) : (
                            <li
                                key={`task-${task.id}`} // unique key for list item
                                style={{
                                    marginBottom: 10,
                                    padding: 10,
                                    border: "1px solid #ccc",
                                    borderRadius: 4,
                                }}
                            >
                                <strong>{task.title}</strong> - {task.description} (Assigned to:{" "}
                                {task.assignedTo})
                                <br />
                                Status:{" "}
                                <select
                                    value={reverseStatusMap[task.status]}
                                    onChange={async (e) => {
                                        const newStatusKey = e.target.value;
                                        const newStatusValue = statusMap[newStatusKey];
                                        try {
                                            await updateStatus(task.id, newStatusValue);
                                            setTasks((prev) =>
                                                prev.map((t) =>
                                                    t.id === task.id
                                                        ? { ...t, status: newStatusValue }
                                                        : t
                                                )
                                            );
                                        } catch (error) {
                                            alert("Failed to update status: " + error.message);
                                        }
                                    }}
                                >
                                    <option value="New">New</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <div style={{ marginTop: 5 }}>
                                    <button
                                        onClick={() => handleEditClick(task)}
                                        style={{ marginRight: 8 }}
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                                </div>
                            </li>
                        )
                    )}
                </ul>
            )}
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
