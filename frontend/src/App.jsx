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

const quadrantOrder = ['Do First', 'Schedule', 'Quick Wins', 'Later']

function App() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newPriority, setNewPriority] = useState(1)
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [activeView, setActiveView] = useState('tasks')
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitCategory, setNewHabitCategory] = useState('custom')
  const [newHabitIsNumeric, setNewHabitIsNumeric] = useState(false)
  const [newHabitGoal, setNewHabitGoal] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedEditDate, setSelectedEditDate] = useState(null)
  const [showWeeklyReport, setShowWeeklyReport] = useState(false)
  const [selectedCalendarHabits, setSelectedCalendarHabits] = useState([])

  const today = new Date().toISOString().split('T')[0]
  const habitColors = ['#6c63ff', '#ff6584', '#43c6ac', '#f9c74f', '#f3722c', '#90be6d']

  function getHabitColor(habitId) {
    const index = habits.findIndex((h) => h.id === habitId)
    return habitColors[index % habitColors.length]
  }

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
      body: JSON.stringify({
        title: newTitle,
        due_date: newDueDate || null,
        priority: Number(newPriority),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setNewTitle('')
        setNewDueDate('')
        setNewPriority(1)
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

  function getTaskQuadrant(task) {
    const isImportant = task.priority >= 2

    let isUrgent = false
    if (task.due_date) {
      const due = new Date(task.due_date)
      const now = new Date()
      const diffDays = (due - now) / (1000 * 60 * 60 * 24)
      isUrgent = diffDays <= 2
    }

    if (isUrgent && isImportant) return 'Do First'
    if (!isUrgent && isImportant) return 'Schedule'
    if (isUrgent && !isImportant) return 'Quick Wins'
    return 'Later'
  }

  function groupTasksByQuadrant() {
    const grouped = { 'Do First': [], 'Schedule': [], 'Quick Wins': [], 'Later': [] }

    tasks
      .filter((task) => !task.is_completed)
      .forEach((task) => {
        grouped[getTaskQuadrant(task)].push(task)
      })

    return grouped
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

  function getDaysInMonth(date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  function goToPreviousMonth() {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    )
  }

  function goToNextMonth() {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    )
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0]
  }

  function getHabitDotsForDay(date) {
    const dateStr = formatDate(date)

    return selectedCalendarHabits.filter((habitId) =>
      habitLogs.some(
        (log) =>
          log.habit === habitId &&
          log.date === dateStr &&
          (log.is_completed || (log.value && log.value > 0))
      )
    )
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

  function handleToggleHabitForDate(habit, dateStr) {
    const existingLog = habitLogs.find(
      (log) => log.habit === habit.id && log.date === dateStr
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
        body: JSON.stringify({ habit: habit.id, date: dateStr, is_completed: true }),
      }).then(() => fetchHabitLogs())
    }
  }

  function getTodayValue(habitId) {
    const log = habitLogs.find(
      (log) => log.habit === habitId && log.date === today
    )
    return log ? log.value || 0 : 0
  }

  function isHabitCompletedOnDate(habitId, dateStr) {
    return habitLogs.some(
      (log) => log.habit === habitId && log.date === dateStr && log.is_completed
    )
  }

  function getValueForDate(habitId, dateStr) {
    const log = habitLogs.find(
      (log) => log.habit === habitId && log.date === dateStr
    )
    return log ? log.value || 0 : 0
  }

  function handleChangeValueForDate(habit, dateStr, delta) {
    const existingLog = habitLogs.find(
      (log) => log.habit === habit.id && log.date === dateStr
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
        body: JSON.stringify({ habit: habit.id, date: dateStr, value: newValue }),
      }).then(() => fetchHabitLogs())
    }
  }

  function getLast7Days() {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(formatDate(d))
    }
    return days
  }

  function getWeeklyStats(habit) {
    const last7 = getLast7Days()
    const relevantLogs = habitLogs.filter(
      (log) => log.habit === habit.id && last7.includes(log.date)
    )

    if (habit.is_numeric) {
      const total = relevantLogs.reduce((sum, log) => sum + (log.value || 0), 0)
      const daysLogged = relevantLogs.length
      const average = daysLogged > 0 ? (total / daysLogged).toFixed(1) : 0
      const goalHit = habit.goal_value
        ? relevantLogs.filter((log) => (log.value || 0) >= habit.goal_value).length
        : null

      return { type: 'numeric', average, daysLogged, goalHit }
    } else {
      const completedDays = relevantLogs.filter((log) => log.is_completed).length
      return { type: 'boolean', completedDays }
    }
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
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
            <button type="submit">Add</button>
          </form>

          {quadrantOrder.map((quadrant) => {
            const quadrantTasks = groupTasksByQuadrant()[quadrant]
            if (quadrantTasks.length === 0) return null

            return (
              <div key={quadrant} className="category-section">
                <h3>{quadrant}</h3>
                <ul className="task-list">
                  {quadrantTasks.map((task) => (
                    <li className="task-item" key={task.id}>
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => handleToggleComplete(task)}
                      />
                      <div className="task-info">
                        <span>{task.title}</span>
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
          })}

          {tasks.some((task) => task.is_completed) && (
            <div className="category-section">
              <h3>Completed</h3>
              <ul className="task-list">
                {tasks
                  .filter((task) => task.is_completed)
                  .map((task) => (
                    <li className="task-item" key={task.id}>
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => handleToggleComplete(task)}
                      />
                      <div className="task-info">
                        <span className="completed">{task.title}</span>
                      </div>
                      <button className="delete-btn" onClick={() => handleDelete(task.id)}>
                        Delete
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </>
      )}

      {activeView === 'habits' && (
        <>
          <h2>Today's Habits</h2>

          <button
            className="calendar-icon-btn"
            onClick={() => {
              setCalendarMonth(new Date())
              setShowCalendar(true)
            }}
          >
            📅
          </button>
          <button className="calendar-icon-btn" onClick={() => setShowWeeklyReport(true)}>
            📊
          </button>

          {showWeeklyReport && (
            <div className="modal-overlay" onClick={() => setShowWeeklyReport(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Weekly Report</h3>

                {Object.keys(groupHabitsByCategory(habits)).map((categoryKey) => (
                  <div key={categoryKey} className="category-section">
                    <h4>{categoryLabels[categoryKey] || categoryKey}</h4>
                    <ul className="task-list">
                      {groupHabitsByCategory(habits)[categoryKey].map((habit) => {
                        const stats = getWeeklyStats(habit)
                        return (
                          <li className="task-item" key={habit.id}>
                            <span>{habit.name}</span>
                            {stats.type === 'boolean' ? (
                              <span className="report-stat">
                                {stats.completedDays}/7 days
                              </span>
                            ) : (
                              <span className="report-stat">
                                avg {stats.average} {categoryUnits[habit.category] || ''}
                                {stats.goalHit !== null && ` · goal hit ${stats.goalHit}/7`}
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}

                <button onClick={() => setShowWeeklyReport(false)}>Close</button>
              </div>
            </div>
          )}

          {showCalendar && (
            <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="calendar-nav">
                  <button onClick={goToPreviousMonth}>←</button>
                  <h3>
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={goToNextMonth}>→</button>
                </div>
                <div className="habit-picker">
                  {habits.map((habit) => (
                    <label key={habit.id} className="habit-picker-item">
                      <input
                        type="checkbox"
                        checked={selectedCalendarHabits.includes(habit.id)}
                        onChange={() => {
                          if (selectedCalendarHabits.includes(habit.id)) {
                            setSelectedCalendarHabits(
                              selectedCalendarHabits.filter((id) => id !== habit.id)
                            )
                          } else {
                            setSelectedCalendarHabits([...selectedCalendarHabits, habit.id])
                          }
                        }}
                      />
                      <span
                        className="habit-color-dot"
                        style={{ backgroundColor: getHabitColor(habit.id) }}
                      ></span>
                      {habit.name}
                    </label>
                  ))}
                </div>

                <div className="calendar-grid">
                  {getDaysInMonth(calendarMonth).map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`calendar-day ${day > new Date() ? 'future-day' : ''}`}
                      onClick={() => {
                        if (day <= new Date()) {
                          setSelectedEditDate(day)
                        }
                      }}
                    >
                      <div>{day.getDate()}</div>
                      <div className="dot-row">
                        {getHabitDotsForDay(day).map((habitId) => (
                          <span
                            key={habitId}
                            className="day-dot"
                            style={{ backgroundColor: getHabitColor(habitId) }}
                          ></span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedEditDate && (
                  <div className="edit-day-panel">
                    <h4>{selectedEditDate.toDateString()}</h4>
                    <ul className="task-list">
                      {habits
                        .filter((habit) => selectedCalendarHabits.includes(habit.id))
                        .map((habit) => {
                          const dateStr = formatDate(selectedEditDate)
                          return (
                            <li className="task-item" key={habit.id}>
                              {habit.is_numeric ? (
                                <>
                                  <span>{habit.name}</span>
                                  <div className="stepper">
                                    <button onClick={() => handleChangeValueForDate(habit, dateStr, -0.5)}>−</button>
                                    <span className="stepper-value">
                                      {getValueForDate(habit.id, dateStr)} {categoryUnits[habit.category] || ''}
                                    </span>
                                    <button onClick={() => handleChangeValueForDate(habit, dateStr, 0.5)}>+</button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <input
                                    type="checkbox"
                                    checked={isHabitCompletedOnDate(habit.id, dateStr)}
                                    onChange={() => handleToggleHabitForDate(habit, dateStr)}
                                  />
                                  <span>{habit.name}</span>
                                </>
                              )}
                            </li>
                          )
                        })}
                    </ul>
                  </div>
                )}

                <button onClick={() => setShowCalendar(false)}>Close</button>
              </div>
            </div>
          )}

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
                          onChange={() => handleToggleHabitForDate(habit, today)}
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