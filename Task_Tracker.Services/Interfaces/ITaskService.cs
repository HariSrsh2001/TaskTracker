using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task_Tracker.Domain.Models;


namespace Task_Tracker.Services.Interfaces
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskItem>> GetAllTasksAsync();
        Task<TaskItem?> GetTaskByIdAsync(Guid id);
        Task<TaskItem> CreateTaskAsync(TaskItem task);
        Task<TaskItem?> UpdateTaskAsync(Guid id, TaskItem task);
        Task<bool> DeleteTaskAsync(Guid id);
    }
}
