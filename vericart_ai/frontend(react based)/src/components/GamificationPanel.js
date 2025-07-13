import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrophy, faFire } from '@fortawesome/free-solid-svg-icons';

function GamificationPanel() {
  return (
    <>
      {/* Gamification Panel */}
      <div className="col-span-full mb-8">
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Investigator Level 7 🏆</h2>
              <div className="flex items-center space-x-4">
                <div className="bg-purple-700 rounded-full px-3 py-1 text-sm">
                  <FontAwesomeIcon icon={faFire} className="mr-1" />
                  12-day streak
                </div>
                <div className="bg-blue-700 rounded-full px-3 py-1 text-sm">
                  2,847 XP
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-300 text-sm">Next Level: 153 XP</div>
              <div className="w-48 bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badges Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🕵️</div>
          <div className="text-white font-semibold">Super Sleuth</div>
          <div className="text-gray-400 text-xs">50+ investigations</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-white font-semibold">Speed Demon</div>
          <div className="text-gray-400 text-xs">&lt; 2min response time</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-white font-semibold">Eagle Eye</div>
          <div className="text-gray-400 text-xs">95%+ accuracy</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-center opacity-50">
          <div className="text-3xl mb-2">🏅</div>
          <div className="text-gray-500 font-semibold">Master Detective</div>
          <div className="text-gray-600 text-xs">100+ cases solved</div>
        </div>
      </div>
    </>
  );
}

export default GamificationPanel;
