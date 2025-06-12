export interface Job {
  JobID: string;
  JobTitle: string;
}

export interface ScoreResult {
  Resume: string;
  MatchScore: number;
  MatchSkills: string;
  MissingSkills: string;
}

export interface ComparisonResult {
  [key: string]: any;
}
