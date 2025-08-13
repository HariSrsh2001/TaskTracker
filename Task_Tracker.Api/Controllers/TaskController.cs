using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using Task_Tracker.Domain.Models;
using Task_Tracker.Services.Interfaces;
using Task_Tracker.Api.Hubs;
using DomainTaskStatus = Task_Tracker.Domain.Models.TaskStatus;

namespace Task_Tracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly IHubContext<TasksHub> _hubContext;

        public TasksController(ITaskService taskService, IHubContext<TasksHub> hubContext)
        {
            _taskService = taskService;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> Post(TaskItem task)
        {
            var created = await _taskService.CreateTaskAsync(task);
            await _hubContext.Clients.All.SendAsync("TaskCreated", created);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        // FULL update (merges instead of overwriting)
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(Guid id, TaskItem updatedTask)
        {
            var existingTask = await _taskService.GetTaskByIdAsync(id);
            if (existingTask == null) return NotFound();

            // Merge fields
            existingTask.Title = updatedTask.Title ?? existingTask.Title;
            existingTask.Description = updatedTask.Description ?? existingTask.Description;
            existingTask.AssignedTo = updatedTask.AssignedTo ?? existingTask.AssignedTo;
            existingTask.Status = updatedTask.Status;
            existingTask.Modified = DateTime.UtcNow;

            var updated = await _taskService.UpdateTaskAsync(id, existingTask);

            await _hubContext.Clients.All.SendAsync("TaskUpdated", updated);
            return Ok(updated);
        }

        // PATCH for only status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] DomainTaskStatus status)
        {
            var existingTask = await _taskService.GetTaskByIdAsync(id);
            if (existingTask == null) return NotFound();

            existingTask.Status = status;
            existingTask.Modified = DateTime.UtcNow;

            var updated = await _taskService.UpdateTaskAsync(id, existingTask);

            await _hubContext.Clients.All.SendAsync("TaskUpdated", updated);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _taskService.DeleteTaskAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
