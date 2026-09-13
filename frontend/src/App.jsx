import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  function fetchTasks() {
    fetch('http://127.0.0.1:8000/api/tasks/')
      .then((response) => response.json())
      .then((data) => setTasks(data))
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

  return (
    <div className="app-container">
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
    </div>
  )
}

export default App