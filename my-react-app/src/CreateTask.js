import React, { useState } from "react";

import { createTask } from "./api/tasks";

function CreateTask({ onTaskCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newTask = await createTask({ title, description, assignedTo });
            onTaskCreated(newTask);
            setTitle("");
            setDescription("");
            setAssignedTo("");
        } catch (error) {
            alert("Failed to create task: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <input
                type="text"
                placeholder="Description"
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <input
                type="text"
                placeholder="Assigned To"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
            <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
                {loading ? "Creating..." : "Create Task"}
            </button>
        </form>
    );
}

export default CreateTask;
