'use client'
import { useEffect, useState } from 'react'
import { ROLES, normalizeRole } from '@/lib/permissions'
import AddUserModal from '@/components/dashboard/AddUserModal'
import EmptyState from '@/components/dashboard/EmptyState'
import type { User } from '@/types'
import '@/styles/pages/(dashboard)/dashboard/projects/projects.scss'
import '@/styles/pages/(dashboard)/dashboard/users/page.scss'

function roleDescription(role: string) {
  return ROLES.find((r) => r.value === role)?.description || ''
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users').then((r) => r.json()).then((d) => {
      // Normalize any pre-migration "admin" role strings still in the DB so
      // the select below shows a real match instead of nothing.
      if (d.success) setUsers(d.data.map((u: User) => ({ ...u, role: normalizeRole(u.role) || u.role })))
      setLoading(false)
    })
  }, [])

  const updateRole = async (user: User, role: User['role']) => {
    setUsers((p) => p.map((u) => u._id === user._id ? { ...u, role } : u))
    const res = await fetch(`/api/users/${user._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (!data.success) setUsers((p) => p.map((u) => u._id === user._id ? { ...u, role: user.role } : u))
  }

  const toggleActive = async (user: User) => {
    const active = !user.active
    setUsers((p) => p.map((u) => u._id === user._id ? { ...u, active } : u))
    const res = await fetch(`/api/users/${user._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }),
    })
    const data = await res.json()
    if (!data.success) setUsers((p) => p.map((u) => u._id === user._id ? { ...u, active: user.active } : u))
  }

  const remove = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setUsers((p) => p.filter((u) => u._id !== id))
    setPendingDelete(null)
  }

  return (
    <div className="dashboard-page">
      <div className="users-page-header">
        <div>
          <h1 className="users-page-title">Users</h1>
          <p className="users-page-subtitle">{users.length} total</p>
        </div>
        <button type="button" onClick={() => setShowAdd(true)} className="users-add-btn">+ Add User</button>
      </div>

      {loading ? (
        <p className="users-loading">Loading…</p>
      ) : users.length === 0 ? (
        <EmptyState message="No users yet." />
      ) : (
        <div className="crud-list">
          {users.map((u) => (
            <div key={u._id} className="crud-row">
              <div className="crud-thumb">{u.name[0]?.toUpperCase()}</div>
              <div className="crud-info">
                <div className="crud-title">{u.name}</div>
                <div className="crud-meta">
                  <span>{u.email}</span>
                  <span>·</span>
                  <span className={u.active ? 'users-status-active' : 'users-status-inactive'}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="users-role-col">
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u, e.target.value as User['role'])}
                  className="form-input users-role-select"
                  title={roleDescription(u.role)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="users-role-hint">{roleDescription(u.role)}</p>
              </div>

              <div className="crud-actions">
                <button type="button" onClick={() => toggleActive(u)} className="crud-edit-btn">
                  {u.active ? 'Deactivate' : 'Activate'}
                </button>
                {pendingDelete === u._id ? (
                  <>
                    <button type="button" onClick={() => remove(u._id)} className="users-delete-confirm-btn">Confirm</button>
                    <button type="button" onClick={() => setPendingDelete(null)} className="crud-edit-btn">Cancel</button>
                  </>
                ) : (
                  <button type="button" onClick={() => setPendingDelete(u._id)} className="users-delete-btn">Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onAdded={(user) => setUsers((p) => [user, ...p])}
        />
      )}
    </div>
  )
}
