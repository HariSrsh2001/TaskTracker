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

//export async function deleteTask(id) {
//    const res = await fetch(`${TASKS_API}/${id}`, { method: "DELETE" });
//    if (!res.ok) throw new Error("Failed to delete task");
//    return id; // return the deleted id so the caller can update state
//}

//export async function deleteTask(id) {
//    const res = await fetch(`${TASKS_API}/${id}`, { method: "DELETE" });
//    if (!res.ok) {
//        const text = await res.text(); // get backend error message
//        throw new Error(`Failed to delete task: ${res.status} ${text}`);
//    }
//}

// New function to update status only:
export async function updateStatus(id, status) {
    const res = await fetch(`${TASKS_API}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status), // just the enum int
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
}

