import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RadialBarChart, RadialBar, Legend } from 'recharts';

interface Job {
  JobID: number;
  JobPosition: string;
  JD: string;
}

interface Resume {
  ResumeName: string
}

const Home: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedResumeName, setselectedResumeName] = useState('');
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch jobs on load
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Error fetching jobs:', err));
  }, []);

  // Fetch resumes when job is selected
  useEffect(() => {
    if (selectedJobId) {
      axios.get(`http://127.0.0.1:5000/api/resumes_for_job?jobId=${selectedJobId}`)
        .then(res => setResumes(res.data))
        .catch(err => console.error('Error fetching resumes:', err));
    }
  }, [selectedJobId]);

  const handleScoreCalculation = () => {
    if (!selectedJobId || !selectedResumeName || !selectedJob) {
      alert('Please select both job and resume.');
      return;
    }

    setScoreResult(null); //Hide chart & reason before new fetch 
    setLoading(true);      // Disable button

    axios.post('http://127.0.0.1:5000/api/score', {
      jobId: selectedJobId,
      resumeName: selectedResumeName,
      JD: selectedJob.JD
    })
      .then(res => setScoreResult(res.data))
      .catch(err => console.error('Error calculating score:', err))
      .finally(() => { setLoading(false); });;
  };

  const getScoreColor = (score: number) => {
  score =  Math.round(score);
  if (score <= 25) return '#DC2626';     // red-600
  if (score <= 50) return '#EA580C';     // orange-500
  if (score <= 75) return '#CA8A04';     // yellow-600
  return '#16A34A';                      // green-600
  };

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-4xl border rounded p-6 shadow-md space-y-6 bg-white">
          {/* Job Dropdown */}
        <div>
          <label className="block font-medium mb-1">Select Job:</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedJobId}
            onChange={(e) => 
            {
              const jobId = e.target.value;
              setSelectedJobId(jobId);
              const job = jobs.find(j => j.JobID.toString() === jobId);
              setSelectedJob(job || null);
            }
          }>
          <option value="">-- Select a job --</option>
          {jobs.map(job => (
            <option key={job.JobID} value={job.JobID}>
              {`${job.JobID} - ${job.JobPosition}`}
            </option>
          ))}
        </select>
        </div>

      {/* Resume Dropdown */}
      <div>
        <label className="block font-medium mb-1">Select Resume:</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedResumeName}
          onChange={(e) => setselectedResumeName(e.target.value)}
          disabled={!selectedJobId}>
          <option value="">-- Select a resume --</option>
          {resumes.map(resume => (
            <option key={resume.ResumeName} value={resume.ResumeName}>
              {resume.ResumeName}
            </option>
          ))}
        </select>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <button
          className={`bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded mt-2 ${loading || !selectedJobId || !selectedResumeName ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleScoreCalculation}
          disabled={loading || !selectedJobId || !selectedResumeName}
        >
          {loading ? 'Calculating...' : 'Calculate Job Fitness'}
        </button>
      </div>
      

      {/* Score Result */}
      {scoreResult && (
        <div className="mt-6 flex flex-col md:flex-row justify-center items-start gap-6">
            {/* Chart */}
            <div className="flex justify-center relative w-[200px] h-[200px]">
            <RadialBarChart
              width={200}
              height={200}
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              data=
              {[
                { name: 'Full', value: 100, fill: '#E5E7EB' }, // grey background
                { name: 'Score', value: scoreResult.score, fill: getScoreColor(scoreResult.score) }
              ]}>

              <RadialBar
                dataKey="value"
                cornerRadius={10}
                background
              />
            </RadialBarChart>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-700">
          {Math.round(scoreResult.score)}%
        </div>
        </div>

    {/* Reason and skills */}
    <div className="bg-gray-50 p-4 rounded shadow">
      <h3 className="font-semibold mb-2">Reason:</h3>
      <p className="text-sm text-gray-700 mb-3">{scoreResult.reason}</p>

      <div className="text-sm">
        <p><strong>Matching Skills:</strong> {scoreResult.matching_skills.join(', ') || 'None'}</p>
        <p><strong>Missing Skills:</strong> {scoreResult.missing_skills.join(', ') || 'None'}</p>
      </div>
    </div>
  </div>
)}
    </div>
      </div>
  );
};

export default Home;
