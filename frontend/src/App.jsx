import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [activeView, setActiveView] = useState('tasks')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchTasks()
    fetchHabits()
    fetchHabitLogs()
  }, [])

  function fetchTasks() {
    fetch('http://127.0.0.1:8000/api/tasks/')
      .then((response) => response.json())
      .then((data) => setTasks(data))
  }

  function fetchHabits() {
    fetch('http://127.0.0.1:8000/api/habits/')
      .then((response) => response.json())
      .then((data) => setHabits(data))
  }

  function fetchHabitLogs() {
    fetch('http://127.0.0.1:8000/api/habit-logs/')
      .then((response) => response.json())
      .then((data) => setHabitLogs(data))
  }

  function handleAddTask(event) {
    event.preventDefault()

    fetch('http://127.0.0.1:8000/api/tasks/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
      .then((response) => response.json())
      .then(() => {
        setNewTitle('')
        fetchTasks()
      })
  }

  function handleToggleComplete(task) {
    fetch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: !task.is_completed }),
    }).then(() => {
      fetchTasks()
    })
  }

  function handleDelete(taskId) {
    fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
      method: 'DELETE',
    }).then(() => {
      fetchTasks()
    })
  }

  function isHabitCompletedToday(habitId) {
    return habitLogs.some(
      (log) => log.habit === habitId && log.date === today && log.is_completed
    )
  }

  function handleToggleHabit(habit) {
    const existingLog = habitLogs.find(
      (log) => log.habit === habit.id && log.date === today
    )

    if (existingLog) {
      fetch(`http://127.0.0.1:8000/api/habit-logs/${existingLog.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !existingLog.is_completed }),
      }).then(() => fetchHabitLogs())
    } else {
      fetch('http://127.0.0.1:8000/api/habit-logs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit: habit.id, date: today, is_completed: true }),
      }).then(() => fetchHabitLogs())
    }
  }

  return (
    <div className="app-container">
      <div className="nav-tabs">
        <button
          className={activeView === 'tasks' ? 'active' : ''}
          onClick={() => setActiveView('tasks')}
        >
          Tasks
        </button>
        <button
          className={activeView === 'habits' ? 'active' : ''}
          onClick={() => setActiveView('habits')}
        >
          Habits
        </button>
      </div>

      {activeView === 'tasks' && (
        <>
          <h1>My Tasks</h1>

          <form className="task-form" onSubmit={handleAddTask}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New task title"
            />
            <button type="submit">Add</button>
          </form>

          <ul className="task-list">
            {tasks.map((task) => (
              <li className="task-item" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.is_completed}
                  onChange={() => handleToggleComplete(task)}
                />
                <div className="task-info">
                  <span className={task.is_completed ? 'completed' : ''}>
                    {task.title}
                  </span>
                  {task.due_date && (
                    <span className="due-date">Due: {task.due_date}</span>
                  )}
                </div>
                <button className="delete-btn" onClick={() => handleDelete(task.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {activeView === 'habits' && (
        <>
          <h2>Today's Habits</h2>
          <ul className="task-list">
            {habits.map((habit) => (
              <li className="task-item" key={habit.id}>
                <input
                  type="checkbox"
                  checked={isHabitCompletedToday(habit.id)}
                  onChange={() => handleToggleHabit(habit)}
                />
                <span className={isHabitCompletedToday(habit.id) ? 'completed' : ''}>
                  {habit.name}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default App