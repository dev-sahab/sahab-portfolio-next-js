'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROLES } from '@/lib/permissions'
import AddUserModal from '@/components/dashboard/AddUserModal'
import EmptyState from '@/components/dashboard/EmptyState'
import type { User } from '@/types'
import '@/styles/pages/(dashboard)/dashboard/projects/projects.scss'
import '@/styles/pages/(dashboard)/dashboard/users/page.scss'

function roleDescription(role: string) {
  return ROLES.find((r) => r.value === role)?.description || ''
}

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [showAdd, setShowAdd] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const updateRole = async (user: User, role: User['role']) => {
    setUsers((p) => p.map((u) => u._id === user._id ? { ...u, role } : u))
    const res = await fetch(`/api/users/${user._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (!data.success) setUsers((p) => p.map((u) => u._id === user._id ? { ...u, role: user.role } : u))
    router.refresh()
  }

  const toggleActive = async (user: User) => {
    const active = !user.active
    setUsers((p) => p.map((u) => u._id === user._id ? { ...u, active } : u))
    const res = await fetch(`/api/users/${user._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }),
    })
    const data = await res.json()
    if (!data.success) setUsers((p) => p.map((u) => u._id === user._id ? { ...u, active: user.active } : u))
    router.refresh()
  }

  const remove = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setUsers((p) => p.filter((u) => u._id !== id))
    setPendingDelete(null)
    router.refresh()
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

      {users.length === 0 ? (
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
          onAdded={(user) => { setUsers((p) => [user, ...p]); router.refresh() }}
        />
      )}
    </div>
  )
}
