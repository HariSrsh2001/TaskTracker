using Microsoft.EntityFrameworkCore;
using Task_Tracker.Api.Hubs;
using Task_Tracker.DAL.Data;
using Task_Tracker.DAL.Respositories;
using Task_Tracker.Domain.Interfaces;
using Task_Tracker.Services.Implementations;
using Task_Tracker.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// Register repository and services
builder.Services.AddScoped<IRepository<Task_Tracker.Domain.Models.TaskItem>, TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS policy for React frontend on localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactClient", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Migrate database automatically
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactClient");

app.UseAuthorization();

app.MapControllers();
app.MapHub<TasksHub>("/hubs/tasks");

app.Run();
