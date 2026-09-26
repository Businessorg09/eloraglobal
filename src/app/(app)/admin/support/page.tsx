'use client'

import { useState, useEffect } from 'react'

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/support?status=${filterStatus}`)
      const data = await res.json()
      if (data.tickets) setTickets(data.tickets)
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [filterStatus])

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status })
      })
      if (res.ok) fetchTickets()
      else alert('Failed to update status')
    } catch (err) {
      alert('Error updating status')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">support_agent</span>
            Support Tickets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage user inquiries and resolutions</p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${filterStatus === s ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-blue-600">sync</span>
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
            <p>No tickets found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs uppercase font-bold">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-medium text-blue-600">{ticket.ticket_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{ticket.users?.full_name}</div>
                      <div className="text-xs text-gray-500">{ticket.users?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{ticket.subject}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{ticket.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ticket.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                      >
                        <option value="OPEN">Mark Open</option>
                        <option value="IN_PROGRESS">Mark In Progress</option>
                        <option value="RESOLVED">Mark Resolved</option>
                        <option value="CLOSED">Mark Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
