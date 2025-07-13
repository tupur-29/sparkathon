import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function StatusUpdateModal({ visible, alertId, onClose, onUpdate }) {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  
  if (!visible) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!status) {
      // Show validation error
      return;
    }
    
    onUpdate(alertId, status, notes);
    
    // Reset form
    setStatus('');
    setNotes('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Update Alert Status</h2>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Status</label>
              <select 
                className="form-input w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="">Select status...</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
              <textarea 
                className="form-input w-full"
                rows="3"
                placeholder="Add notes about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex space-x-3">
              <button type="submit" className="btn btn-primary flex-1">
                Update Status
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StatusUpdateModal;
