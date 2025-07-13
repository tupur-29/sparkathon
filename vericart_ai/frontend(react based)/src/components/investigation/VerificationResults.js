import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

function VerificationResults() {
  // This would typically come from API responses
  const [verificationResult, setVerificationResult] = useState({
    status: 'authentic', // 'authentic', 'suspicious', 'counterfeit'
    trustScore: 94.2,
    riskLevel: 'LOW',
    productDetails: {
      name: 'Apple iPhone 15 Pro',
      manufacturer: 'Apple Inc.',
      serialNumber: 'F2LX4V9GJHK3',
      manufactureDate: '2023-09-15',
      lastVerified: '2 minutes ago'
    },
    socialProof: {
      totalVerifications: 1247,
      authenticRate: 94.2
    }
  });
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'authentic': return 'bg-green-900 border-green-600';
      case 'suspicious': return 'bg-yellow-900 border-yellow-600';
      case 'counterfeit': return 'bg-red-900 border-red-600';
      default: return 'bg-gray-900 border-gray-600';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'authentic': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-xl mr-3" />;
      case 'suspicious': return <i className="fas fa-exclamation-circle text-yellow-400 text-xl mr-3"></i>;
      case 'counterfeit': return <i className="fas fa-times-circle text-red-400 text-xl mr-3"></i>;
      default: return <i className="fas fa-question-circle text-gray-400 text-xl mr-3"></i>;
    }
  };
  
  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'authentic': return 'Product Verified - Authentic';
      case 'suspicious': return 'Product Verification - Suspicious';
      case 'counterfeit': return 'Product Verification - Counterfeit';
      default: return 'Product Verification - Unknown';
    }
  };
  
  const getStatusTextColor = (status) => {
    switch (status.toLowerCase()) {
      case 'authentic': return 'text-green-300';
      case 'suspicious': return 'text-yellow-300';
      case 'counterfeit': return 'text-red-300';
      default: return 'text-gray-300';
    }
  };
  
  const getStatusDescription = (status) => {
    switch (status.toLowerCase()) {
      case 'authentic': return 'This product has been verified as authentic using blockchain verification.';
      case 'suspicious': return 'This product has some suspicious indicators that need further investigation.';
      case 'counterfeit': return 'This product appears to be counterfeit based on our verification process.';
      default: return 'Unable to verify this product with the provided information.';
    }
  };
  
  const getStatusDescriptionColor = (status) => {
    switch (status.toLowerCase()) {
      case 'authentic': return 'text-green-200';
      case 'suspicious': return 'text-yellow-200';
      case 'counterfeit': return 'text-red-200';
      default: return 'text-gray-200';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Verification Results</h2>
      
      <div className={`${getStatusColor(verificationResult.status)} rounded-lg p-4 mb-4`}>
        <div className="flex items-center mb-2">
          {getStatusIcon(verificationResult.status)}
          <span className={`${getStatusTextColor(verificationResult.status)} font-semibold text-lg`}>
            {getStatusText(verificationResult.status)}
          </span>
        </div>
        <p className={`${getStatusDescriptionColor(verificationResult.status)} text-sm`}>
          {getStatusDescription(verificationResult.status)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-300 text-sm">Trust Score</div>
          <div className="text-green-400 text-2xl font-bold">{verificationResult.trustScore}%</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-gray-300 text-sm">Risk Level</div>
          <div className="text-green-400 text-2xl font-bold">{verificationResult.riskLevel}</div>
        </div>
      </div>

      {/* Product Information Panel */}
      <div className="mt-6 border-t border-gray-600 pt-4">
        <h3 className="text-lg font-semibold text-white mb-3">Product Information</h3>
        <div className="space-y-3">
          {Object.entries(verificationResult.productDetails).map(([key, value]) => (
            <div className="flex justify-between" key={key}>
              <span className="text-gray-300">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </span>
              <span className="text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof Stats */}
      <div className="mt-6 border-t border-gray-600 pt-4">
        <h3 className="text-lg font-semibold text-white mb-3">Social Proof</h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Total Verifications</span>
            <span className="text-white font-bold">
              {verificationResult.socialProof.totalVerifications.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Authentic Rate</span>
            <span className="text-green-400 font-bold">{verificationResult.socialProof.authenticRate}%</span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full" 
              style={{ width: `${verificationResult.socialProof.authenticRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationResults;
