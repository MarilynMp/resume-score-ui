import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import axios from 'axios'; 

const Compare: React.FC = () =>  {
  const [jobs, setJobs] = useState<{ JobID: number; JobPosition: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [resumes, setResumes] = useState<{ ResumeJobMappingID: number; ResumeName: string }[]>([]);
  const [resume1, setResume1] = useState<string | null>(null);
  const [resume2, setResume2] = useState<string | null>(null);
  const [fitness1, setFitness1] = useState<any>(null);
  const [fitness2, setFitness2] = useState<any>(null);

  const [comparisonData, setComparisonData] = useState<null | {
  resume1: {
    name: string;
    matched: string;
    missing: string;
    score: number;
  };
  resume2: {
    name: string;
    matched: string;
    missing: string;
    score: number;
  };
}>(null);


  useEffect(() => {
     axios.get('http://127.0.0.1:5000/api/jobs') // Update URL if needed
    .then(response => {
      setJobs(response.data);
    })
    .catch(error => {
      console.error('Failed to fetch jobs', error);
    });
    if (selectedJob !== null) {
      // setResumes(jobResumesMap[selectedJob] || []);
       axios.get(`http://127.0.0.1:5000/api/resumes_for_job?jobId=${selectedJob}`)
      .then(response => {
      setResumes(response.data);
      setResume1(null);
      setResume2(null);
      setComparisonData(null);
      })
      .catch(err => {
        console.error('Failed to fetch resumes', err);
      });
    }
  }, [selectedJob]);

  const availableResume1 = resumes.filter((res) => res.ResumeName !== resume2);
  const availableResume2 = resumes.filter((res) => res.ResumeName !== resume1);

  const handleCompare = async () => {
  if (!selectedJob || !resume1 || !resume2) return;

  try {
    const [res1, res2] = await Promise.all([
      axios.get('http://127.0.0.1:5000/api/jobfitness', {
        params: { job_id: selectedJob, resume_name: resume1 }
      }),
      axios.get('http://127.0.0.1:5000/api/jobfitness', {
        params: { job_id: selectedJob, resume_name: resume2 }
      }),
    ]);

    const fitness1 = res1.data;
    const fitness2 = res2.data;

    // Step 3: Match/Miss Calculation
   const stats1 = {
      name: fitness1.ResumeName,
      matchedCount: fitness1.MatchSkills,
      missingCount: fitness1.MissingSkills,
      matchingScore: fitness1.MatchScore
    };

    const stats2 = {
      name: fitness2.ResumeName,
      matchedCount: fitness2.MatchSkills,
      missingCount: fitness2.MissingSkills,
      matchingScore: fitness2.MatchScore
    };

    // Step 4: Store or render stats as needed
    console.log("Resume 1:", fitness1.ResumeName, stats1);
    console.log("Resume 2:", fitness2.ResumeName, stats2);

    // Optional: Set to state to display in chart
    setFitness1({ ...fitness1, ...stats1 });
    setFitness2({ ...fitness2, ...stats2 });

    // Use setComparisonData for charts
   setComparisonData(
    {
      resume1: 
      {
        name: stats1.name,
        matched: stats1.matchedCount,
        missing: stats1.missingCount,
        score: stats1.matchingScore,
      },
      resume2: {
        name: stats2.name,
        matched: stats2.matchedCount,
        missing: stats2.missingCount,
        score: stats2.matchingScore,
      },
    });

  } catch (err) {
    console.error("Compare failed", err);
  }
    console.log(comparisonData);
  };


  return (
    <div className="border rounded p-4 shadow-md space-y-4 max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-2">Compare Resumes</h2>

      {/* Job Dropdown */}
      <div>
        <label className="block font-medium mb-1">Select Job:</label>
        <select
  className="w-full border p-2 rounded"
  value={selectedJob ?? ''}
  onChange={(e) => setSelectedJob(Number(e.target.value))}
>
  <option value="">-- Select Job --</option>
  {jobs.map((job) => (
    <option key={job.JobID} value={job.JobID}>
      {job.JobID} - {job.JobPosition}
    </option>
  ))}
</select>

      </div>

      {/* Resume 1 Dropdown */}
      {resumes.length > 0 && (
        <div>
          <label className="block font-medium mb-1">Select Resume 1:</label>
          <select
            className="w-full border p-2 rounded"
            value={resume1 ?? ''}
            onChange={(e) => setResume1(e.target.value)}
          >
            <option value="">-- Select Resume 1 --</option>
            {availableResume1.map((res) => (
              <option key={res.ResumeJobMappingID} value={res.ResumeName}>
                {res.ResumeName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Resume 2 Dropdown */}
      {resumes.length > 0 && (
        <div>
          <label className="block font-medium mb-1">Select Resume 2:</label>
          <select
            className="w-full border p-2 rounded"
            value={resume2 ?? ''}
            onChange={(e) => setResume2(e.target.value)}
          >
            <option value="">-- Select Resume 2 --</option>
            {availableResume2.map((res) => (
              <option key={res.ResumeJobMappingID} value={res.ResumeName}>
                {res.ResumeName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Compare Button */}
      <div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleCompare}
          disabled={!resume1 || !resume2}
        >
          Compare
        </button>
      </div>

      {/* Charts */}
      {comparisonData && (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Resume 1 */}
    <div>
      <h3 className="text-lg font-semibold mb-2">
        {comparisonData.resume1.name || 'Resume 1'}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
  <BarChart
    data={[
      { name: 'Matching Score', value: comparisonData.resume1.score },
      {
        name: 'Matched Skills',
        value: comparisonData.resume1.matched.split(',').length
      },
      {
        name: 'Missing Skills',
        value: comparisonData.resume1.missing.length
      }
    ]}
    margin={{ top: 10, right: 30, left: 30, bottom: 100 }}
  >
    <XAxis dataKey="name" angle={-45} textAnchor="end" dy={10} />
    <YAxis allowDecimals={false} domain={[0, 100]} />
    <Tooltip />
    <Bar dataKey="value" fill="#3182ce" />
  </BarChart>
</ResponsiveContainer>


      <div className="mt-4">
        <p className="font-medium">Missing Skills:</p>
        <ul className="list-disc list-inside text-sm text-gray-600">
  {(Array.isArray(comparisonData.resume1.missing)
    ? comparisonData.resume1.missing
    : (typeof comparisonData.resume1.missing === 'string'
        ? comparisonData.resume1.missing.split(',') 
        : [])
  ).map((skill, idx) => (
    <li key={idx}>{skill.trim()}</li>
  ))}
</ul>
      </div>
    </div>

    {/* Resume 2 */}
    <div>
      <h3 className="text-lg font-semibold mb-2">
        {comparisonData.resume2.name || 'Resume 2'}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={[
            { name: 'Matching Score', value: comparisonData.resume2.score },
            {
              name: 'Matched Skills',
              value: comparisonData.resume2.matched.split(',').length
            },
            {
              name: 'Missing Skills',
              value: comparisonData.resume2.missing.length
            }
          ]}
          margin={{ top: 10, right: 30, left: 30, bottom: 100 }}
        >
          <XAxis dataKey="name" angle={-45} textAnchor="end" dy={10} />
          <YAxis allowDecimals={false} domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="value" fill="#4a5568" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4">
        <p className="font-medium">Missing Skills:</p>
        <ul className="list-disc list-inside text-sm text-gray-600">
  {(Array.isArray(comparisonData.resume2.missing)
    ? comparisonData.resume2.missing
    : (typeof comparisonData.resume2.missing === 'string'
        ? comparisonData.resume2.missing.split(',') 
        : [])
  ).map((skill, idx) => (
    <li key={idx}>{skill.trim()}</li>
  ))}
</ul>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Compare;
