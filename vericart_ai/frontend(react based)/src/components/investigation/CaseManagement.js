import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faUsers, 
  faFileExport 
} from '@fortawesome/free-solid-svg-icons';

function CaseManagement() {
  const [selectedCaseId, setSelectedCaseId] = useState('case-001');
  
  // Sample cases data
  const cases = [
    {
      id: 'case-001',
      priority: 'URGENT',
      status: 'Active',
      title: 'Counterfeit iPhone Investigation',
      description: 'Large scale counterfeit operation detected',
      caseNumber: '2024-001',
      dueDate: 'Jan 20',
      createdDate: 'Jan 15, 2024',
      assignedTo: 'John Smith',
      summary: 'Multiple reports of counterfeit iPhone 15 Pro devices detected in the New York metropolitan area. AI analysis indicates a sophisticated counterfeiting operation with high-quality replicas that pass initial visual inspection but fail detailed technical verification.',
      stats: {
        productsAffected: 23,
        locations: 8,
        estimatedLoss: '$27K',
        daysActive: 5
      },
      evidence: [
        {
          title: 'Serial Number Analysis',
          description: 'Pattern analysis reveals systematic serial number generation'
        },
        {
          title: 'RFID Signatures',
          description: 'Anomalous RFID patterns detected across all suspect devices'
        },
        {
          title: 'Geographic Clusters',
          description: 'Heat map showing concentration of suspicious activities'
        }
      ],
      actions: [
        {
          type: 'blue',
          text: 'Evidence collected from Manhattan location',
          time: '2 hours ago',
          user: 'John Smith'
        },
        {
          type: 'green',
          text: 'Lab analysis completed for samples #1-5',
          time: '5 hours ago',
          user: 'Sarah Johnson'
        },
        {
          type: 'yellow',
          text: 'Coordination with local law enforcement initiated',
          time: '1 day ago',
          user: 'Mike Wilson'
        }
      ]
    },
    {
      id: 'case-002',
      priority: 'MEDIUM',
      status: 'In Progress',
      title: 'Suspicious Movement Pattern',
      description: 'Products moving at impossible speeds',
      caseNumber: '2024-002',
      dueDate: 'Jan 25',
      createdDate: 'Jan 14, 2024',
      assignedTo: 'Sarah Johnson',
      summary: 'Multiple products showing unrealistic movement patterns, suggesting possible transportation of counterfeits or manipulation of the tracking system. Products appear to move at speeds exceeding 200 km/h between distant locations.',
      stats: {
        productsAffected: 15,
        locations: 12,
        estimatedLoss: '$18K',
        daysActive: 3
      },
      evidence: [
        {
          title: 'GPS Data Analysis',
          description: 'Speed calculations showing impossible transportation times'
        },
        {
          title: 'Scanner Logs',
          description: 'Inconsistent scan patterns across multiple devices'
        }
      ],
      actions: [
        {
          type: 'blue',
          text: 'Added satellite tracking data to evidence',
          time: '4 hours ago',
          user: 'Sarah Johnson'
        },
        {
          type: 'green',
          text: 'Initial report drafted for review',
          time: '1 day ago',
          user: 'Mike Wilson'
        }
      ]
    },
    {
      id: 'case-003',
      priority: 'LOW',
      status: 'Review',
      title: 'RFID Signal Anomalies',
      description: 'Investigating weak RFID signals',
      caseNumber: '2024-003',
      dueDate: 'Feb 1',
      createdDate: 'Jan 12, 2024',
      assignedTo: 'Lisa Chen',
            summary: 'Several products showing unusual RFID signal characteristics that don\'t match expected patterns. Could indicate tampering or damage to the authentication chips, or potentially counterfeit products with improperly cloned RFID signals.',
      stats: {
        productsAffected: 8,
        locations: 3,
        estimatedLoss: '$5K',
        daysActive: 7
      },
      evidence: [
        {
          title: 'RFID Signal Strength Tests',
          description: 'Comparative analysis with authentic products'
        },
        {
          title: 'Lab Report',
          description: 'Preliminary findings on signal inconsistencies'
        }
      ],
      actions: [
        {
          type: 'blue',
          text: 'Added additional test results to case file',
          time: '6 hours ago',
          user: 'Lisa Chen'
        },
        {
          type: 'yellow',
          text: 'Requested more samples for testing',
          time: '2 days ago',
          user: 'John Smith'
        }
      ]
    },
    {
      id: 'case-004',
      priority: 'MEDIUM',
      status: 'Resolved',
      title: 'Packaging Inconsistencies',
      description: 'Resolved: Manufacturing error confirmed',
      caseNumber: '2024-004',
      dueDate: 'Jan 15',
      createdDate: 'Jan 8, 2024',
      assignedTo: 'Mike Wilson',
      summary: 'Investigation into packaging inconsistencies found on a batch of products. Initially suspected as counterfeits, but further investigation confirmed a manufacturing error at an authorized facility.',
      stats: {
        productsAffected: 42,
        locations: 2,
        estimatedLoss: '$0',
        daysActive: 4
      },
      evidence: [
        {
          title: 'Packaging Analysis',
          description: 'Visual and material comparison with standard packaging'
        },
        {
          title: 'Manufacturing Records',
          description: 'Batch records from production facility'
        },
        {
          title: 'Resolution Report',
          description: 'Final determination of manufacturing error'
        }
      ],
      actions: [
        {
          type: 'green',
          text: 'Case closed - manufacturing error confirmed',
          time: '1 day ago',
          user: 'Mike Wilson'
        },
        {
          type: 'blue',
          text: 'Final report submitted',
          time: '1 day ago',
          user: 'Mike Wilson'
        },
        {
          type: 'yellow',
          text: 'Recommendation for process improvement sent',
          time: '2 days ago',
          user: 'Lisa Chen'
        }
      ]
    }
  ];

  // Get currently selected case
  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
      {/* Case List */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Open Cases</h2>
          <button className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Case
          </button>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {cases.map(caseItem => (
            <div 
              key={caseItem.id}
              className={`alert-item ${selectedCaseId === caseItem.id ? 'selected' : ''}`}
              onClick={() => setSelectedCaseId(caseItem.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`metric-badge metric-${caseItem.priority === 'URGENT' ? 'high' : caseItem.priority === 'MEDIUM' ? 'medium' : 'low'}`}>
                  {caseItem.priority}
                </span>
                <span className={`text-xs ${caseItem.status === 'Resolved' ? 'text-green-400' : 'text-gray-400'}`}>
                  {caseItem.status}
                </span>
              </div>
              <p className="text-white font-medium">{caseItem.title}</p>
              <p className="text-gray-400 text-sm">{caseItem.description}</p>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Case #{caseItem.caseNumber}</span>
                <span>{caseItem.status === 'Resolved' ? `Closed: ${caseItem.dueDate}` : `Due: ${caseItem.dueDate}`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Details */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Case #{selectedCase.caseNumber}: {selectedCase.title}
              </h2>
              <div className="flex items-center space-x-4">
                <span className={`metric-badge metric-${selectedCase.priority === 'URGENT' ? 'high' : selectedCase.priority === 'MEDIUM' ? 'medium' : 'low'}`}>
                  {selectedCase.priority}
                </span>
                <span className="text-gray-400 text-sm">Created: {selectedCase.createdDate}</span>
                <span className="text-gray-400 text-sm">Assigned: {selectedCase.assignedTo}</span>
              </div>
            </div>
            <button className="btn btn-secondary">
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit Case
            </button>
          </div>

          {/* Case Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Case Summary</h3>
            <p className="text-gray-300 mb-4">
              {selectedCase.summary}
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">Products Affected</div>
                <div className="text-white text-xl font-bold">{selectedCase.stats.productsAffected}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">Locations</div>
                <div className="text-white text-xl font-bold">{selectedCase.stats.locations}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">Est. Loss</div>
                <div className="text-white text-xl font-bold">{selectedCase.stats.estimatedLoss}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">Days Active</div>
                <div className="text-white text-xl font-bold">{selectedCase.stats.daysActive}</div>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Evidence</h3>
            <div className="space-y-3">
              {selectedCase.evidence.map((item, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-gray-300 text-sm">{item.description}</p>
                    </div>
                    <button className="btn btn-secondary">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Recent Actions</h3>
            <div className="space-y-3">
              {selectedCase.actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 bg-${action.type}-400 rounded-full`}></div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{action.text}</div>
                    <div className="text-gray-400 text-xs">{action.time} - {action.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Case Actions */}
          <div className="flex space-x-3 flex-wrap gap-2">
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Evidence
            </button>
            <button className="btn btn-warning">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Assign Team
            </button>
            <button className="btn btn-secondary">
              <FontAwesomeIcon icon={faFileExport} className="mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseManagement;
