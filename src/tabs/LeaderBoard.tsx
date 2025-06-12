import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMedal } from 'react-icons/fa';

interface Job {
  JobID: number;
  JobPosition: string;
  JD: string;
}

interface LeaderboardEntry {
  ResumeName: string;
  MatchScore: number;
}

const medalColors = ['text-yellow-400', 'text-gray-400', 'text-orange-400'];

const LeaderBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [results, setResults] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Fetch job list from API
    axios.get('http://127.0.0.1:5000/api/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Error fetching jobs:', err));
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    // Fetch leaderboard results for selected job
    axios.get(`http://127.0.0.1:5000/api/jobFitnessResults?jobID=${selectedJobId}`)
      .then(res => setResults(res.data))
      .catch(err => console.error('Error fetching leaderboard:', err));
  }, [selectedJobId]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Job:
      </label>
      <select
        value={selectedJobId}
        onChange={(e) => setSelectedJobId(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
      >
        <option value="">-- Select a job --</option>
        {jobs.map(job => (
          <option key={job.JobID} value={job.JobID}>
              {`${job.JobID} - ${job.JobPosition}`}
          </option>
        ))}
      </select>

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Rank</th>
                <th className="p-3">Resume</th>
                <th className="p-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((entry, index) => (
                <tr key={entry.ResumeName} className="border-t">
                  <td className="p-3 font-medium flex items-center gap-2">
                    <FaMedal className={medalColors[index]} />
                    #{index + 1}
                  </td>
                  <td className="p-3">{entry.ResumeName}</td>
                  <td className="p-3">{entry.MatchScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderBoard;
