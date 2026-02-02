// Mock data for WPC300 - Problem Solving and Actionable Analytics

// Single Course
export const courses = [
  {
    id: 'wpc300',
    name: 'Problem Solving and Actionable Analytics',
    code: 'WPC300',
    color: '#8C1D40', // ASU Maroon
    icon: 'analytics',
    progress: 15,
    semester: 'Spring 2026',
    instructor: 'Professor Smith',
  },
];

// Modules based on typical analytics course structure
export const courseModules = {
  'wpc300': [
    { 
      id: 'mod-1', 
      name: 'Introduction to Problem Solving', 
      weeks: '1-2', 
      progress: 100,
      topics: ['Define Problem Solving', 'Seven-Step Process', 'Excel Basics']
    },
    { 
      id: 'mod-2', 
      name: 'Data Collection & Preparation', 
      weeks: '3-4', 
      progress: 75,
      topics: ['Data Sources', 'Data Cleaning', 'VLOOKUP & HLOOKUP']
    },
    { 
      id: 'mod-3', 
      name: 'Descriptive Analytics', 
      weeks: '5-6', 
      progress: 50,
      topics: ['Summary Statistics', 'Data Visualization', 'Pivot Tables']
    },
    { 
      id: 'mod-4', 
      name: 'Diagnostic Analytics', 
      weeks: '7-8', 
      progress: 25,
      topics: ['Root Cause Analysis', 'Correlation', 'Regression Basics']
    },
    { 
      id: 'mod-5', 
      name: 'Predictive Analytics', 
      weeks: '9-10', 
      progress: 0,
      topics: ['Forecasting', 'Trend Analysis', 'What-If Analysis']
    },
    { 
      id: 'mod-6', 
      name: 'Prescriptive Analytics & Presentation', 
      weeks: '11-12', 
      progress: 0,
      topics: ['Decision Making', 'Recommendations', 'Business Presentations']
    },
  ],
};

// Keep backward compatibility
export const modules = courses;

// Flashcards per module
export const flashcards = {
  'mod-1': [
    {
      id: 'fc-1-1',
      front: 'What is the Bulletproof Problem-Solving approach?',
      back: 'A seven-step structured process for solving complex business problems: 1) Define the problem, 2) Disaggregate issues, 3) Prioritize, 4) Build workplan, 5) Conduct analysis, 6) Synthesize findings, 7) Communicate recommendations.',
      difficulty: 'medium',
    },
    {
      id: 'fc-1-2',
      front: 'Why has problem-solving become a top desired skill in business?',
      back: 'Business environments are increasingly complex and data-driven. Companies need employees who can analyze situations, identify root causes, and develop actionable solutions rather than just follow procedures.',
      difficulty: 'easy',
    },
    {
      id: 'fc-1-3',
      front: 'What does the VLOOKUP function do in Excel?',
      back: 'VLOOKUP searches for a value in the first column of a table and returns a value in the same row from a specified column. Syntax: =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
      difficulty: 'easy',
    },
    {
      id: 'fc-1-4',
      front: 'What is the difference between VLOOKUP and HLOOKUP?',
      back: 'VLOOKUP searches vertically (down the first column), while HLOOKUP searches horizontally (across the first row). Use VLOOKUP for column-based data and HLOOKUP for row-based data.',
      difficulty: 'easy',
    },
    {
      id: 'fc-1-5',
      front: 'What Excel functions help with date calculations?',
      back: 'TODAY() returns current date, DATEIF() calculates difference between dates, WORKDAY() returns work days, NETWORKDAYS() counts work days between dates, and DATE() creates a date from year/month/day.',
      difficulty: 'medium',
    },
  ],
  'mod-2': [
    {
      id: 'fc-2-1',
      front: 'What is data cleaning?',
      back: 'The process of detecting and correcting (or removing) corrupt, inaccurate, or irrelevant records from a dataset. Includes handling missing values, duplicates, and formatting inconsistencies.',
      difficulty: 'easy',
    },
    {
      id: 'fc-2-2',
      front: 'What does the INDEX-MATCH combination do?',
      back: 'A more flexible alternative to VLOOKUP. INDEX returns a value at a given position, MATCH finds the position of a value. Together they can look up values in any direction and column.',
      difficulty: 'medium',
    },
    {
      id: 'fc-2-3',
      front: 'What are common data quality issues?',
      back: 'Missing values, duplicate records, inconsistent formatting, outliers, incorrect data types, and data entry errors.',
      difficulty: 'easy',
    },
  ],
  'mod-3': [
    {
      id: 'fc-3-1',
      front: 'What is descriptive analytics?',
      back: 'The examination of data to answer "What happened?" Uses summary statistics, data aggregation, and visualization to describe past events and current state.',
      difficulty: 'easy',
    },
    {
      id: 'fc-3-2',
      front: 'What is a Pivot Table used for?',
      back: 'A data summarization tool that automatically sorts, counts, totals, or gives the average of data stored in a table. Allows quick analysis without writing formulas.',
      difficulty: 'easy',
    },
    {
      id: 'fc-3-3',
      front: 'Name the key measures of central tendency.',
      back: 'Mean (average), Median (middle value), and Mode (most frequent value). Each provides different insights about the data distribution.',
      difficulty: 'easy',
    },
  ],
  'mod-4': [
    {
      id: 'fc-4-1',
      front: 'What is diagnostic analytics?',
      back: 'Analysis that examines data to answer "Why did it happen?" Uses techniques like drill-down, data discovery, and correlations to find root causes.',
      difficulty: 'medium',
    },
    {
      id: 'fc-4-2',
      front: 'What is correlation vs causation?',
      back: 'Correlation means two variables move together, but doesn\'t prove one causes the other. Causation means one variable directly affects another. "Correlation does not imply causation."',
      difficulty: 'medium',
    },
  ],
  'mod-5': [
    {
      id: 'fc-5-1',
      front: 'What is predictive analytics?',
      back: 'Analysis that uses historical data, statistical algorithms, and machine learning to identify the likelihood of future outcomes. Answers "What is likely to happen?"',
      difficulty: 'medium',
    },
    {
      id: 'fc-5-2',
      front: 'What is a What-If Analysis in Excel?',
      back: 'A process of changing values in cells to see how those changes affect the outcome of formulas. Includes Goal Seek, Scenario Manager, and Data Tables.',
      difficulty: 'easy',
    },
  ],
  'mod-6': [
    {
      id: 'fc-6-1',
      front: 'What is prescriptive analytics?',
      back: 'The most advanced analytics type that suggests actions to take. Answers "What should we do?" Uses optimization, simulation, and decision analysis.',
      difficulty: 'medium',
    },
    {
      id: 'fc-6-2',
      front: 'What makes a good business presentation?',
      back: 'Clear problem statement, structured narrative, data-driven insights, actionable recommendations, and appropriate visualizations. Tell a story with your data.',
      difficulty: 'easy',
    },
  ],
};

// Documents are hidden from students - this is just for internal reference
export const documents = {};

export const quizzes = {
  'mod-1': [
    {
      id: 'quiz-1-1',
      title: 'Problem Solving Fundamentals',
      questions: 10,
      difficulty: 'easy',
      bestScore: null,
    },
  ],
  'mod-2': [
    {
      id: 'quiz-2-1',
      title: 'Data Preparation Techniques',
      questions: 8,
      difficulty: 'medium',
      bestScore: null,
    },
  ],
};

export const chatHistory = [];

export const recentGenerations = [];

export const activityLog = [
  { id: 'act-1', action: 'Started Module 1', time: '2 days ago', type: 'study' },
  { id: 'act-2', action: 'Completed Excel tutorial', time: '3 days ago', type: 'study' },
];

export const games = [];

export const aiProcessingSteps = [
  { id: 1, label: 'Analyzing your question', duration: 600 },
  { id: 2, label: 'Searching course materials', duration: 800 },
  { id: 3, label: 'Finding relevant content', duration: 600 },
  { id: 4, label: 'Generating response', duration: 0 },
];

// Syllabus data for the Syllabus Q&A feature
export const syllabusInfo = {
  courseName: 'WPC300 - Problem Solving and Actionable Analytics',
  semester: 'Spring 2026',
  instructor: 'Professor Smith',
  email: 'professor.smith@asu.edu',
  officeHours: 'Tuesday & Thursday 2:00-4:00 PM',
  
  importantDates: [
    { event: 'Module 1 Assignment Due', date: 'January 31, 2026', type: 'assignment' },
    { event: 'Module 2 Assignment Due', date: 'February 14, 2026', type: 'assignment' },
    { event: 'Midterm Exam', date: 'February 28, 2026', type: 'exam' },
    { event: 'Module 3 Assignment Due', date: 'March 14, 2026', type: 'assignment' },
    { event: 'Module 4 Assignment Due', date: 'March 28, 2026', type: 'assignment' },
    { event: 'Spring Break', date: 'March 15-22, 2026', type: 'holiday' },
    { event: 'Module 5 Assignment Due', date: 'April 11, 2026', type: 'assignment' },
    { event: 'Final Project Due', date: 'April 25, 2026', type: 'assignment' },
    { event: 'Final Exam', date: 'May 5, 2026', type: 'exam' },
  ],
  
  gradingPolicy: {
    assignments: 40,
    midterm: 20,
    finalExam: 25,
    participation: 10,
    finalProject: 5,
  },
  
  policies: [
    'All assignments are due by the dates listed in Canvas',
    'Late submissions receive 10% penalty per day',
    'Academic integrity violations result in automatic failure',
    'Attendance is mandatory for in-person sessions',
  ],
};
