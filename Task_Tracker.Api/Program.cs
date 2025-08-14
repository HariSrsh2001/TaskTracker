using Microsoft.EntityFrameworkCore;
using Task_Tracker.Api.Hubs;
using Task_Tracker.DAL.Data;
using Task_Tracker.DAL.Respositories;
using Task_Tracker.Domain.Interfaces;
using Task_Tracker.Services.Implementations;
using Task_Tracker.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

const string ReactDevCorsPolicy = "ReactDevPolicy";

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy for React frontend running on localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: ReactDevCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure EF Core with SQL Server connection string from appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repositories and services
builder.Services.AddScoped<IRepository<Task_Tracker.Domain.Models.TaskItem>, TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();

var app = builder.Build();

// Enable Swagger in development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS with the defined policy - important to put before authorization and endpoints
app.UseCors(ReactDevCorsPolicy);

app.UseAuthorization();

app.MapControllers();
app.MapHub<TasksHub>("/taskhub"); // <-- Change to match React client


app.Run();
