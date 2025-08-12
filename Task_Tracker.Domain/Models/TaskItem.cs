using System;

namespace Task_Tracker.Domain.Models
{
    public enum TaskStatus
    {
        New,
        InProgress,
        Completed
    }

    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string AssignedTo { get; set; } = string.Empty;
        public TaskStatus Status { get; set; } = TaskStatus.New;
        public DateTime CreatedAt { get; set; }
        public DateTime Modified { get; set; }
    }
}
