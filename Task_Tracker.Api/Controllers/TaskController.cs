using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using Task_Tracker.Domain.Models;
using Task_Tracker.Services.Interfaces;
using Task_Tracker.Api.Hubs;
using Task_Tracker.Domain.Models;
using Task_Tracker.Services.Interfaces;

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

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(Guid id, TaskItem task)
        {
            var updated = await _taskService.UpdateTaskAsync(id, task);
            if (updated == null) return NotFound();

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
