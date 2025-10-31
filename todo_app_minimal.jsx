import React, { useEffect, useState, useRef } from 'react';

// Todo App Minimal - Executable in canvas
// Features (small but realistic):
// - add task (Enter or button)
// - delete task
// - persist in localStorage
// - simple edit on double click
// - basic a11y & keyboard support
// - tiny, intentional "ugly" styling

const STORAGE_KEY = 'todo_minimal_v1';

function makeId() {
  // small unique id (not cryptographically strong)
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function TodoAppExecutable() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
  }, []);

  // Persist to localStorage on tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks]);

  const addTask = () => {
    const text = input.trim();
    if (text === '') return;
    const newTask = { id: makeId(), text, created_at: new Date().toISOString() };
    setTasks(prev => [...prev, newTask]);
    setInput('');
    inputRef.current?.focus();
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = (id) => {
    const text = editingText.trim();
    if (text === '') {
      // if empty after edit, do nothing (or delete?) We'll revert
      setEditingId(null);
      setEditingText('');
      return;
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    setEditingId(null);
    setEditingText('');
  };

  const onInputKeyDown = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const onEditKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEdit(id);
    if (e.key === 'Escape') {
      setEditingId(null);
      setEditingText('');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>To-Do Minimal</h1>

      <div style={styles.inputRow}>
        <input
          ref={inputRef}
          aria-label="Nouvelle tâche"
          placeholder="Ajouter une tâche..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          style={styles.input}
        />
        <button onClick={addTask} style={styles.addButton} aria-label="Ajouter tâche">Ajouter</button>
      </div>

      <div style={styles.metaRow}>
        <div>Total: {tasks.length}</div>
        <div>
          <button onClick={() => { setTasks([]); }} style={styles.clearButton} title="Vider la liste">Vider</button>
        </div>
      </div>

      <ul style={styles.list}>
        {tasks.map(task => (
          <li key={task.id} style={styles.listItem}>
            {editingId === task.id ? (
              <input
                value={editingText}
                onChange={e => setEditingText(e.target.value)}
                onKeyDown={e => onEditKeyDown(e, task.id)}
                onBlur={() => saveEdit(task.id)}
                autoFocus
                style={styles.editInput}
                aria-label={`Éditer tâche ${task.text}`}
              />
            ) : (
              <div style={styles.itemRow}>
                <span
                  onDoubleClick={() => startEdit(task)}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') startEdit(task); }}
                  style={styles.taskText}
                  title="Double-cliquer ou appuyer Entrée pour éditer"
                >
                  {task.text}
                </span>
                <div style={styles.itemButtons}>
                  <button onClick={() => startEdit(task)} style={styles.smallButton} aria-label={`Éditer ${task.text}`}>✏️</button>
                  <button onClick={() => deleteTask(task.id)} style={styles.smallButton} aria-label={`Supprimer ${task.text}`}>🗑️</button>
                </div>
              </div>
            )}
          </li>
        ))}
        {tasks.length === 0 && (
          <li style={styles.empty}>Aucune tâche 💡 ajoute la première !</li>
        )}
      </ul>

      <footer style={styles.footer}>Version minimale ⚡ stockage local (localStorage)</footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    padding: 20,
    maxWidth: 620,
    margin: '8px auto',
    border: '1px solid #ddd',
    borderRadius: 6,
    background: '#fff'
  },
  title: { margin: '0 0 8px 0', fontSize: 18 },
  inputRow: { display: 'flex', gap: 8, marginBottom: 10 },
  input: { flex: 1, padding: '8px 10px', fontSize: 14, border: '1px solid #ccc' },
  addButton: { padding: '8px 12px', cursor: 'pointer' },
  metaRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: '#444' },
  clearButton: { padding: '4px 8px', fontSize: 12, cursor: 'pointer' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { padding: '8px 6px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' },
  empty: { padding: 12, color: '#666' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  taskText: { outline: 'none', cursor: 'text' },
  itemButtons: { display: 'flex', gap: 6 },
  smallButton: { padding: '4px 6px', cursor: 'pointer' },
  editInput: { flex: 1, padding: '6px 8px', fontSize: 14, width: '100%' },
  footer: { marginTop: 10, fontSize: 11, color: '#999' }
};