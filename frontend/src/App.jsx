import { useState, useEffect } from 'react'
import './App.css'

const categoryLabels = {
  journaling: 'Journaling',
  fitness: 'Fitness',
  nutrition: 'Nutrition',
  supplement: 'Supplement',
  sleep: 'Sleep',
  mood: 'Mood',
  screen_time: 'Screen Time',
  study: 'Study',
  custom: 'Custom',
}
const categoryUnits = {
  nutrition: 'glasses',
  sleep: 'hrs',
  screen_time: 'hrs',
  study: 'hrs',
  custom: '',
}
function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [activeView, setActiveView] = useState('tasks')
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState('custom')
  const [newHabitIsNumeric, setNewHabitIsNumeric] = useState(false)
  const [newHabitGoal, setNewHabitGoal] = useState('')

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

  function groupHabitsByCategory(habitsList) {
    const grouped = {}

    habitsList.forEach((habit) => {
      if (!grouped[habit.category]) {
        grouped[habit.category] = []
      }
      grouped[habit.category].push(habit)
    })

    return grouped
  }

  function handleAddHabit(event) {
    event.preventDefault()

    fetch('http://127.0.0.1:8000/api/habits/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newHabitName,
        category: newHabitCategory,
        is_numeric: newHabitIsNumeric,
        goal_value: newHabitGoal || null,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setNewHabitName('')
        setNewHabitCategory('custom')
        setNewHabitIsNumeric(false)
        setNewHabitGoal('')
        fetchHabits()
      })
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

  function getTodayValue(habitId) {
    const log = habitLogs.find(
      (log) => log.habit === habitId && log.date === today
    )
    return log ? log.value || 0 : 0
  }

  function handleChangeValue(habit, delta) {
    const existingLog = habitLogs.find(
      (log) => log.habit === habit.id && log.date === today
    )
    const currentValue = existingLog ? existingLog.value || 0 : 0
    const newValue = Math.max(0, currentValue + delta)

    if (existingLog) {
      fetch(`http://127.0.0.1:8000/api/habit-logs/${existingLog.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      }).then(() => fetchHabitLogs())
    } else {
      fetch('http://127.0.0.1:8000/api/habit-logs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit: habit.id, date: today, value: newValue }),
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

          <form className="task-form" onSubmit={handleAddHabit}>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="New habit name"
            />
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
            >
              {Object.keys(categoryLabels).map((key) => (
                <option key={key} value={key}>
                  {categoryLabels[key]}
                </option>
              ))}
            </select>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newHabitIsNumeric}
                onChange={(e) => setNewHabitIsNumeric(e.target.checked)}
              />
              Numeric
            </label>
            <button type="submit">Add</button>
          </form>

          {Object.keys(groupHabitsByCategory(habits)).map((categoryKey) => (
            <div key={categoryKey} className="category-section">
              <h3>{categoryLabels[categoryKey] || categoryKey}</h3>
              <ul className="task-list">
                {groupHabitsByCategory(habits)[categoryKey].map((habit) => (
                  <li className="task-item" key={habit.id}>
                    {habit.is_numeric ? (
                      <>
                        <span>{habit.name}</span>
                        <div className="stepper">
                          <button onClick={() => handleChangeValue(habit, -0.5)}>−</button>
                          <span className="stepper-value">
                            {getTodayValue(habit.id)} {categoryUnits[habit.category] || ''}
                          </span>

                          <button onClick={() => handleChangeValue(habit, 0.5)}>+</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={isHabitCompletedToday(habit.id)}
                          onChange={() => handleToggleHabit(habit)}
                        />
                        <span className={isHabitCompletedToday(habit.id) ? 'completed' : ''}>
                          {habit.name}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default App