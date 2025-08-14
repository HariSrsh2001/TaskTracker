using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Task_Tracker.Api.Hubs
{
    public class TasksHub : Hub
    {
        // Method to notify all clients that tasks have been updated (e.g., task added or status changed)
        public async Task NotifyTasksUpdated()
        {
            await Clients.All.SendAsync("ReceiveTasksUpdate");
        }
    }
}
