const API_BASE = "http://localhost:5249"; // your backend URL
const TASKS_API = `${API_BASE}/api/tasks`;

export async function getTasks() {
    const res = await fetch(TASKS_API);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
}

export async function createTask(task) {
    const res = await fetch(TASKS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
}

export async function updateTask(id, task) {
    const res = await fetch(`${TASKS_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
}

export async function deleteTask(id) {
    const res = await fetch(`${TASKS_API}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete task");
}
