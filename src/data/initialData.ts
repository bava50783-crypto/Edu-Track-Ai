import type { RubricCriterion, StudyDocSummary } from '../db/schema.ts';

export interface CourseItem {
  id: number;
  code: string;
  name: string;
  department: string;
  instructor: string;
  section: string;
  completionPct: number;
  enrolledCount: number;
  colorHex: string;
}

export interface AssignmentItem {
  id: number;
  courseCode: string;
  courseName: string;
  instructor: string;
  title: string;
  subtitle: string;
  description: string;
  dueLabel: string;
  countdownLabel: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'Urgent' | 'High' | 'Medium' | 'Normal';
  weightPct: number;
  estimatedMins: number;
  graceRemaining?: string | null;
  score?: string | null;
  submittedFileName?: string | null;
  rubricJson: RubricCriterion[];
  aiHint?: string | null;
}

export interface AnnouncementItem {
  id: number;
  department: string;
  author: string;
  authorRole: string;
  title: string;
  excerpt: string;
  category: string;
  priority: string;
  audience: string;
  courseRef: string;
  tagsJson: string[];
  body: string;
  sessionTitle?: string | null;
  sessionTime?: string | null;
  sessionRoom?: string | null;
  seatStudentId?: string | null;
  seatRow?: string | null;
  seatStation?: string | null;
  proctor?: string | null;
  permittedJson: string[];
  prohibitedJson: string[];
  attachmentsJson: Array<{ name: string; size: string; kind: string }>;
  pinned: boolean;
  starred: boolean;
  isRead: boolean;
  acknowledged: boolean;
  publishedLabel: string;
}

export interface StudyDocumentItem {
  id: number;
  courseCode: string;
  department: string;
  fileName: string;
  fileSizeLabel: string;
  pageCount: number;
  rawContent: string;
  summaryJson: StudyDocSummary;
}

export interface ChatMessageItem {
  id: number;
  sessionId: number;
  role: 'user' | 'assistant';
  content: string;
  badgeLabel?: string | null;
  timeLabel: string;
  codeSnippet?: string | null;
  gotchaTip?: string | null;
}

export interface ChatSessionItem {
  id: number;
  title: string;
  courseScopeJson: string[];
  deepReasoning: boolean;
  dateLabel: string;
  messages: ChatMessageItem[];
}

export interface StudyGoalItem {
  targetHours: number;
  loggedTenths: number;
  dailyHoursJson: number[];
}

export interface WaiverRequestItem {
  id: number;
  studentName: string;
  courseCode: string;
  assignmentTitle: string;
  reason: string;
  requestedHours: number;
  status: 'pending' | 'approved' | 'rejected';
  receivedLabel: string;
}

export interface DiscussionThreadItem {
  id: number;
  studentName: string;
  initials: string;
  courseCode: string;
  threadNumber: string;
  question: string;
  aiDraft?: string | null;
  replyText?: string | null;
  repliesCount: number;
  resolved: boolean;
  timeAgo: string;
}

export interface FacultyScheduleItem {
  id: number;
  title: string;
  timeRange: string;
  location: string;
  badgeText: string;
}

export const INITIAL_COURSES: CourseItem[] = [
  {
    id: 1,
    code: 'CS301',
    name: 'Distributed Systems',
    department: 'Computer Science',
    instructor: 'Dr. Aris Thorne',
    section: 'Section A • 48 Students',
    completionPct: 70,
    enrolledCount: 94,
    colorHex: '#414cce',
  },
  {
    id: 2,
    code: 'MATH240',
    name: 'Linear Algebra',
    department: 'Mathematics',
    instructor: 'Prof. Elena Vance',
    section: 'Section A • 62 Students',
    completionPct: 85,
    enrolledCount: 62,
    colorHex: '#5c4bc3',
  },
  {
    id: 3,
    code: 'BIO110',
    name: 'Cell Biology',
    department: 'Biological Sciences',
    instructor: 'Dr. Marcus Webb',
    section: 'Section C • 54 Students',
    completionPct: 50,
    enrolledCount: 54,
    colorHex: '#28A879',
  },
  {
    id: 4,
    code: 'ENG205',
    name: 'Technical Writing',
    department: 'Humanities & Comm.',
    instructor: 'Prof. Ronald Kim',
    section: 'Section B • 32 Students',
    completionPct: 90,
    enrolledCount: 32,
    colorHex: '#F3B64A',
  },
  {
    id: 5,
    code: 'CS450',
    name: 'Cloud Native Microservices',
    department: 'Computer Science',
    instructor: 'Dr. Aris Thorne',
    section: 'Section B • 36 Students',
    completionPct: 100,
    enrolledCount: 48,
    colorHex: '#5b67e8',
  },
];

export const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 1,
    courseCode: 'CS301',
    courseName: 'Distributed Systems',
    instructor: 'Dr. Aris Thorne',
    title: 'Distributed Consensus & Raft Protocol',
    subtitle: 'Python / Go test suite',
    description:
      'Implement Raft leader election, randomized election timeouts, persistent state log entries, and split-brain partition recovery across a 5-node cluster.',
    dueLabel: 'Mar 24, 11:59 PM',
    countdownLabel: '1 Day Overdue',
    status: 'overdue',
    priority: 'High',
    weightPct: 20,
    estimatedMins: 75,
    graceRemaining: '23h 14m left',
    score: null,
    submittedFileName: null,
    aiHint:
      "Your local unit tests failed on Leader Election split-brain edge cases. Review Section 5.2 of Ongaro's Raft paper before re-submitting.",
    rubricJson: [
      { id: 'r1', label: 'Heartbeat RPC protocol message handling (25 pts)', points: 25, earned: 25, met: true },
      { id: 'r2', label: 'Persistent log store write-ahead logging (25 pts)', points: 25, earned: 25, met: true },
      { id: 'r3', label: 'AppendEntries concurrency test suites (30 pts)', points: 30, earned: 30, met: true },
      { id: 'r4', label: 'Cluster partition recovery simulation (20 pts)', points: 20, earned: 0, met: false },
    ],
  },
  {
    id: 2,
    courseCode: 'MATH240',
    courseName: 'Linear Algebra',
    instructor: 'Prof. Elena Vance',
    title: 'Eigenvectors & Diagonalization',
    subtitle: 'Proof exercises Sec 5.3',
    description:
      'Complete orthogonal diagonalization proofs for symmetric matrices and spectral decomposition exercises 1–14.',
    dueLabel: 'Mar 28, 5:00 PM',
    countdownLabel: 'Due in 2 days',
    status: 'pending',
    priority: 'Medium',
    weightPct: 15,
    estimatedMins: 60,
    graceRemaining: null,
    score: null,
    submittedFileName: null,
    aiHint:
      'Remember that distinct eigenvalues of a real symmetric matrix always yield mutually orthogonal eigenvectors.',
    rubricJson: [
      { id: 'm1', label: 'Characteristic polynomial derivation (30 pts)', points: 30, earned: 30, met: true },
      { id: 'm2', label: 'Eigenspace basis normalization (35 pts)', points: 35, earned: 0, met: false },
      { id: 'm3', label: 'Spectral theorem proof write-up (35 pts)', points: 35, earned: 0, met: false },
    ],
  },
  {
    id: 3,
    courseCode: 'BIO110',
    courseName: 'Cell Biology',
    instructor: 'Dr. Marcus Webb',
    title: 'Cellular Energy Dynamics Lab',
    subtitle: 'Spectrophotometry analysis',
    description:
      'Analyze NADH absorbance curves across mitochondrial electron transport inhibitors and plot Michaelis-Menten kinetics.',
    dueLabel: 'Apr 02, 11:59 PM',
    countdownLabel: '7 Days Left',
    status: 'pending',
    priority: 'Normal',
    weightPct: 12,
    estimatedMins: 50,
    graceRemaining: null,
    score: null,
    submittedFileName: null,
    aiHint:
      'Compare your rotenone control slope against baseline pyruvate oxidation before exporting CSV graphs.',
    rubricJson: [
      { id: 'b1', label: 'Spectrophotometer calibration curve (25 pts)', points: 25, earned: 25, met: true },
      { id: 'b2', label: 'ATP yield stoichiometry table (40 pts)', points: 40, earned: 0, met: false },
      { id: 'b3', label: 'Inhibitor mechanism discussion (35 pts)', points: 35, earned: 0, met: false },
    ],
  },
  {
    id: 4,
    courseCode: 'ENG205',
    courseName: 'Technical Writing',
    instructor: 'Prof. Ronald Kim',
    title: 'Modernist Poetics & Thesis Draft',
    subtitle: 'Draft 2 of 3',
    description:
      'Peer assessment and structural revision of your 2,400-word technical systems monograph with IEEE citation audit.',
    dueLabel: 'Mar 30, 11:59 PM',
    countdownLabel: '4 Days Left',
    status: 'pending',
    priority: 'Medium',
    weightPct: 10,
    estimatedMins: 40,
    graceRemaining: null,
    score: null,
    submittedFileName: null,
    aiHint:
      'Focus peer feedback on abstract conciseness and active voice in methodology paragraphs.',
    rubricJson: [
      { id: 'e1', label: 'Executive abstract clarity (30 pts)', points: 30, earned: 30, met: true },
      { id: 'e2', label: 'Peer critique rubric annotations (40 pts)', points: 40, earned: 40, met: true },
      { id: 'e3', label: 'IEEE citation formatting audit (30 pts)', points: 30, earned: 0, met: false },
    ],
  },
  {
    id: 5,
    courseCode: 'CS450',
    courseName: 'Cloud Native Microservices',
    instructor: 'Dr. Aris Thorne',
    title: 'Service Mesh & Istio Routing Lab',
    subtitle: 'Kubernetes manifests',
    description: 'Configure canary traffic shifting, circuit breakers, and mTLS telemetry.',
    dueLabel: 'Mar 18, 11:59 PM',
    countdownLabel: 'Graded',
    status: 'completed',
    priority: 'Normal',
    weightPct: 18,
    estimatedMins: 90,
    graceRemaining: null,
    score: '95/100',
    submittedFileName: 'istio_canary_bundle.tar.gz',
    aiHint: 'All Envoy sidecar health checks passed with zero 503 retries.',
    rubricJson: [
      { id: 'c1', label: 'VirtualService weight split (40 pts)', points: 40, earned: 40, met: true },
      { id: 'c2', label: 'DestinationRule circuit breaker (35 pts)', points: 35, earned: 35, met: true },
      { id: 'c3', label: 'Prometheus canary telemetry (25 pts)', points: 25, earned: 20, met: true },
    ],
  },
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 1,
    department: 'Dept of Computer Science',
    author: 'Dr. Aris Thorne',
    authorRole: 'CS Dept Head',
    title: 'Midterm Examination Schedule & Seating Allocation Released',
    excerpt:
      'Exam room assignments and seating matrices are now finalized for CS301 and CS450. Please check your assigned...',
    category: 'Urgent Alert',
    priority: 'High Priority / Mandatory',
    audience: 'Audience: All CS Undergraduates',
    courseRef: 'Course Ref: CS-2025-S',
    tagsJson: ['Action Required', 'CS301', 'CS450'],
    body:
      'Please review the finalized schedules, venue allocations, and technical integrity requirements for the upcoming Spring 2025 midterm examinations. All registered students in CS301 (Data Structures & Algorithms) and CS450 (Distributed Systems) must report to their assigned hall 15 minutes before the exam begins with a verified institutional photo ID.',
    sessionTitle: 'CS301 Midterm Examination',
    sessionTime: 'Thursday, March 27, 2025 • 10:00 AM - 12:30 PM EST',
    sessionRoom: 'Turing Hall 101',
    seatStudentId: '#EDU-9942',
    seatRow: 'Row C • Seat 14',
    seatStation: 'Dell OptiPlex (Secure OS v4.2)',
    proctor: 'Prof. Katherine Ellis',
    permittedJson: [
      'One 8.5" x 11" double-sided handwritten cheat sheet.',
      'Physical blue or black pens, mechanical pencils.',
      'Institutional Student SmartCard for check-in.',
      'Official scratch paper will be provided at the station.',
    ],
    prohibitedJson: [
      'Smartphones, smartwatches, or cellular peripherals.',
      'Programmable calculators or external flash drives.',
      'Personal mechanical keyboards or headphones.',
      'Printed textbook manuals or printed cheat sheets.',
    ],
    attachmentsJson: [
      { name: 'CS301_Midterm_Seating_Matrix.pdf', size: '1.4 MB • PDF Document', kind: 'PDF' },
      { name: 'Exam_Rules_Notice_Spring25.pdf', size: '420 KB • Departmental Notice', kind: 'PDF' },
    ],
    pinned: true,
    starred: true,
    isRead: false,
    acknowledged: false,
    publishedLabel: 'Today, 9:30 AM',
  },
  {
    id: 2,
    department: 'Campus Services & Central Library',
    author: 'Elena Rostova',
    authorRole: 'Director of Library Operations',
    title: 'Library Extended Study Hours for Spring Midterm Prep',
    excerpt:
      'Main library will remain open 24/7 with reserved quiet study pods starting this Friday through finals week. Night shuttles...',
    category: 'Facility Notice',
    priority: 'Normal',
    audience: 'Audience: All Campus Students',
    courseRef: 'FACILITY-LIB-25',
    tagsJson: ['Campus Info', 'Facility'],
    body:
      'Beginning Friday at 8:00 AM through the end of Midterm Week, Central Science & Engineering Library Levels 2–4 will operate 24 hours daily. Group collaboration pods may be reserved in 2-hour blocks via your EduTrack portal, and late-night campus shuttle Loop B runs every 15 minutes from the North Plaza.',
    sessionTitle: 'Extended Quiet Zone Access',
    sessionTime: 'March 28 – April 12 • Open 24/7',
    sessionRoom: 'Central Library Levels 2–4',
    seatStudentId: null,
    seatRow: null,
    seatStation: null,
    proctor: null,
    permittedJson: ['Covered beverages', 'Quiet study laptops', 'Student SmartCard after 10 PM'],
    prohibitedJson: ['Hot food items in archive wing', 'Unreserved group calls on Floor 4'],
    attachmentsJson: [{ name: 'Spring_Shuttle_Timetable.pdf', size: '310 KB • Schedule', kind: 'PDF' }],
    pinned: false,
    starred: false,
    isRead: false,
    acknowledged: false,
    publishedLabel: 'Yesterday, 4:15 PM',
  },
  {
    id: 3,
    department: 'Academic Advisory & Registrar',
    author: 'Office of the Registrar',
    authorRole: 'Academic Policy Board',
    title: 'Course Withdrawal & Pass/Fail Election Deadline Approaching',
    excerpt:
      'Final deadline to submit change-of-status forms through the student portal without academic penalty is Friday, April 4 at...',
    category: 'Policy Advisory',
    priority: 'Normal',
    audience: 'Audience: All Undergraduates',
    courseRef: 'REG-2025-04',
    tagsJson: ['Academic Policy', 'Registrar'],
    body:
      'Students considering Pass/Fail grading elections or late course withdrawals for Spring 2025 must obtain digital advisor sign-off before Friday, April 4 at 5:00 PM EST. Major core courses such as CS301 and MATH240 require letter grades and are not eligible for Pass/Fail conversion.',
    sessionTitle: null,
    sessionTime: null,
    sessionRoom: null,
    seatStudentId: null,
    seatRow: null,
    seatStation: null,
    proctor: null,
    permittedJson: [],
    prohibitedJson: [],
    attachmentsJson: [{ name: 'Registrar_Status_Change_Guide.pdf', size: '512 KB • Policy PDF', kind: 'PDF' }],
    pinned: false,
    starred: false,
    isRead: true,
    acknowledged: false,
    publishedLabel: 'Mar 22, 2025',
  },
  {
    id: 4,
    department: 'AI & Robotics Student Chapter',
    author: 'AI Research Colloquium',
    authorRole: 'Invited Seminar Series',
    title: 'Guest Lecture: Scalable Consensus Models with Distributed AI Systems',
    excerpt:
      'Join visiting researchers for a live seminar in Turing Hall auditorium with hands-on breakout discussions on fault tolerance...',
    category: 'Keynote Seminar',
    priority: 'Normal',
    audience: 'Audience: CS & Engineering Majors',
    courseRef: 'SEM-CS-402',
    tagsJson: ['Event', 'Guest Speaker'],
    body:
      'This Thursday evening seminar explores deterministic state machine replication under high-throughput ML inference clusters, connecting classic Raft/Paxos guarantees to modern GPU parameter servers. Extra credit attendance tokens will be scanned at the auditorium entrance.',
    sessionTitle: 'Keynote Seminar & Live Q&A',
    sessionTime: 'Thursday, March 27 • 5:30 PM – 7:00 PM',
    sessionRoom: 'Turing Auditorium',
    seatStudentId: null,
    seatRow: null,
    seatStation: null,
    proctor: null,
    permittedJson: [],
    prohibitedJson: [],
    attachmentsJson: [],
    pinned: false,
    starred: false,
    isRead: true,
    acknowledged: false,
    publishedLabel: 'Mar 20, 2025',
  },
  {
    id: 5,
    department: 'Faculty of Computer Science • SysAdmin',
    author: 'Compute Infrastructure Team',
    authorRole: 'Systems Engineering',
    title: 'Lab Server Maintenance: Compute Cluster 3 Offline Saturday Midnight',
    excerpt:
      'Scheduled kernel upgrades and GPU cluster sync. Save all long-running simulation checkpoints before 11:30 PM...',
    category: 'Infrastructure',
    priority: 'Normal',
    audience: 'Audience: Lab Cluster Users',
    courseRef: 'SYS-CLUSTER-03',
    tagsJson: ['Maintenance', 'Tech Notice'],
    body:
      'Engineering Lab Compute Cluster 3 (nodes c3-01 through c3-16) will be offline Saturday from 12:00 AM to 4:00 AM for security kernel patching and NVMe storage rebalancing. All active Docker containers and distributed Raft simulation pods should be checkpointed beforehand.',
    sessionTitle: null,
    sessionTime: null,
    sessionRoom: null,
    seatStudentId: null,
    seatRow: null,
    seatStation: null,
    proctor: null,
    permittedJson: [],
    prohibitedJson: [],
    attachmentsJson: [],
    pinned: false,
    starred: false,
    isRead: true,
    acknowledged: false,
    publishedLabel: 'Mar 18, 2025',
  },
];

export const INITIAL_DOCUMENTS: StudyDocumentItem[] = [
  {
    id: 1,
    courseCode: 'CS301',
    department: 'Computer Science',
    fileName: 'CS301_Distributed_Systems_Ch4.pdf',
    fileSizeLabel: '6.8 MB',
    pageCount: 24,
    rawContent:
      'Chapter 4 formalizes state machine replication in asynchronous distributed network topologies prone to packet dropping and transient node crashes. Raft decomposes consensus into Leader Election, Log Replication, and Safety invariants. Heartbeat broadcast cycles are set strictly at 150-300ms randomized intervals to avoid split-vote livelocks. Majority quorum Q = floor(N/2) + 1 guarantees any two majorities overlap by at least one node. A leader cannot commit a log entry from a prior term purely by counting replicas; it must commit an entry from its current term.',
    summaryJson: {
      confidence: '98.4%',
      readingTime: '3.5m',
      executiveOverview:
        'Chapter 4 formalizes the fundamental problem of state machine replication in asynchronous distributed network topologies prone to packet dropping and transient node crashes. It contrasts standard Byzantine fault-tolerant architectures against crash-recovery models, concluding with the invariant proofs behind the Raft Consensus Algorithm for predictable leader election and atomic log commits.',
      keyConcepts: [
        {
          kicker: 'STATE TRANSITION',
          title: 'Consensus Protocols',
          description:
            'Ensures all functional replicas agree on the exact sequence of log executions regardless of network partitions.',
          section: 'Section 4.1',
        },
        {
          kicker: 'TIMING PARAMETERS',
          title: 'Heartbeat Timers',
          description:
            'Leader broadcast cycles set strictly at 150-300ms intervals to guarantee election timeout resets across peers.',
          section: 'Section 4.4',
        },
        {
          kicker: 'QUORUM MATH',
          title: 'Majority Quorum',
          description:
            'Guarantees split-brain immunity where partition acknowledgment strictly requires Q = floor(N/2) + 1.',
          section: 'Section 4.8',
        },
      ],
      formulas: [
        {
          title: 'Quorum Intersection Theorem',
          latex: 'Q = ⌊ N / 2 ⌋ + 1',
          description: 'Any two majorities must overlap by at least one node, ensuring consistency.',
        },
        {
          title: 'Byzantine Fault Bound',
          latex: 'F_max < N / 3',
          description: 'Max tolerated arbitrary/malicious faulty nodes in an unauthenticated system.',
        },
      ],
      checklist: [
        {
          id: 'chk1',
          title: 'Rule 1: Candidate Ballot Tie-Breaking',
          detail: 'If split vote occurs, election times out with randomized sleep (150ms-300ms) to prevent deadlock loops.',
          checked: true,
        },
        {
          id: 'chk2',
          title: 'Rule 2: Leader AppendEntries Heartbeat Response',
          detail: "Followers overwrite conflicting uncommitted indices using Leader's authoritative log match index.",
          checked: true,
        },
        {
          id: 'chk3',
          title: 'Rule 3: Log Entry Commitment Safety Invariant',
          detail:
            'A leader cannot commit a log entry from a prior term purely by counting replicas; it must commit an entry from its current term.',
          checked: false,
        },
      ],
      examTakeaway:
        'Expect a theoretical multi-node partition question on the upcoming midterm: always sketch timeline indices and demonstrate that the partitioned leader cannot commit entries without receiving positive ACKs from a verified majority.',
    },
  },
  {
    id: 2,
    courseCode: 'MATH240',
    department: 'Mathematics',
    fileName: 'MATH240_Linear_Algebra_Notes.pdf',
    fileSizeLabel: '3.2 MB',
    pageCount: 18,
    rawContent:
      'Eigenvalues, eigenspaces, algebraic vs geometric multiplicity, orthogonal diagonalization of real symmetric matrices A = Q D Q^T, and Singular Value Decomposition (SVD). Spectral Theorem guarantees real eigenvalues and orthogonal eigenspaces for symmetric operators.',
    summaryJson: {
      confidence: '97.1%',
      readingTime: '2.8m',
      executiveOverview:
        'Covers diagonalizability criteria, algebraic versus geometric multiplicities, and the Spectral Theorem for real symmetric matrices, culminating in Singular Value Decomposition (SVD) for rectangular transformations.',
      keyConcepts: [
        {
          kicker: 'DECOMPOSITION',
          title: 'Spectral Theorem',
          description: 'Every real symmetric matrix is orthogonally diagonalizable with purely real eigenvalues.',
          section: 'Section 5.3',
        },
        {
          kicker: 'MULTIPLICITY',
          title: 'Defect & Rank',
          description: 'A matrix is diagonalizable iff geometric multiplicity equals algebraic multiplicity for every λ.',
          section: 'Section 5.4',
        },
        {
          kicker: 'RECTANGULAR',
          title: 'SVD Factorization',
          description: 'Decomposes any m×n matrix A into UΣV^T using left and right singular vectors.',
          section: 'Section 6.1',
        },
      ],
      formulas: [
        {
          title: 'Orthogonal Diagonalization',
          latex: 'A = Q Λ Qᵀ',
          description: 'Q is orthogonal (Q⁻¹ = Qᵀ) and Λ contains real eigenvalues.',
        },
        {
          title: 'Characteristic Equation',
          latex: 'det(A - λI) = 0',
          description: 'Roots define the spectrum of linear operator A.',
        },
      ],
      checklist: [
        {
          id: 'mchk1',
          title: 'Check orthogonality of eigenvectors from distinct eigenvalues',
          detail: 'Verify dot product vᵢ · vⱼ = 0 for symmetric A.',
          checked: true,
        },
        {
          id: 'mchk2',
          title: 'Normalize basis vectors via Gram-Schmidt when multiplicity > 1',
          detail: 'Ensure unit length columns in orthogonal matrix Q.',
          checked: false,
        },
      ],
      examTakeaway:
        'On diagonalization proofs, always verify both characteristic roots and nullity(A - λI) before constructing P.',
    },
  },
  {
    id: 3,
    courseCode: 'BIO110',
    department: 'Biology',
    fileName: 'BIO110_Enzyme_Kinetics_Guide.pdf',
    fileSizeLabel: '2.4 MB',
    pageCount: 12,
    rawContent:
      'Michaelis-Menten kinetics v0 = Vmax[S] / (Km + [S]), Lineweaver-Burk double reciprocal plots, competitive vs noncompetitive inhibition, and NADH spectrophotometry at 340 nm.',
    summaryJson: {
      confidence: '96.8%',
      readingTime: '2.2m',
      executiveOverview:
        'Synthesizes steady-state enzyme kinetics, Km affinity constants, allosteric regulation, and spectrophotometric measurement of NADH oxidation at 340 nm for cellular respiration labs.',
      keyConcepts: [
        {
          kicker: 'RATE LAW',
          title: 'Michaelis-Menten',
          description: 'Describes hyperbolic velocity saturation as substrate concentration exceeds Km.',
          section: 'Lab Module 2',
        },
        {
          kicker: 'INHIBITION',
          title: 'Competitive Binding',
          description: 'Increases apparent Km while leaving Vmax unchanged at saturating substrate.',
          section: 'Lab Module 3',
        },
        {
          kicker: 'ASSAY',
          title: '340nm Absorbance',
          description: 'Tracks real-time NADH consumption via Beer-Lambert molar extinction.',
          section: 'Lab Module 4',
        },
      ],
      formulas: [
        {
          title: 'Michaelis-Menten Equation',
          latex: 'v₀ = (V_max · [S]) / (K_m + [S])',
          description: 'Km equals substrate concentration at half-maximal velocity.',
        },
        {
          title: 'Beer-Lambert Law',
          latex: 'A = ε · b · c',
          description: 'Relates optical absorbance directly to molar chromophore concentration.',
        },
      ],
      checklist: [
        {
          id: 'bchk1',
          title: 'Blank spectrophotometer with cuvette buffer at 340 nm',
          detail: 'Zero baseline absorbance prior to adding mitochondrial extract.',
          checked: true,
        },
        {
          id: 'bchk2',
          title: 'Plot 1/v₀ vs 1/[S] to distinguish inhibitor type',
          detail: 'Compare y-intercept shifts for noncompetitive vs competitive controls.',
          checked: false,
        },
      ],
      examTakeaway:
        'Remember that competitive inhibitors raise apparent Km without altering Vmax, whereas uncompetitive inhibitors lower both.',
    },
  },
];

export const INITIAL_CHAT_SESSIONS: ChatSessionItem[] = [
  {
    id: 1,
    title: 'Raft Log Compaction & Split-Vote Prevention',
    courseScopeJson: ['CS301', 'MATH240', 'BIO110', 'ENG205'],
    deepReasoning: true,
    dateLabel: 'Yesterday',
    messages: [
      {
        id: 1,
        sessionId: 1,
        role: 'assistant',
        badgeLabel: 'Course Synthesizer',
        timeLabel: '09:14 AM',
        content:
          "Good morning, Alex! I've synthesized your syllabi, code submissions, and upcoming milestone deliverables.\n\n• **CS301 Lab 2: Raft Consensus** — Grace: 23h remaining\n• **MATH240 Midterm 2** — In 4 days\n\nHow would you like to direct our focus today? We can dive straight into your distributed consensus edge cases, run eigenvalue proof exercises, or format your technical lab report.",
      },
      {
        id: 2,
        sessionId: 1,
        role: 'user',
        badgeLabel: 'Student',
        timeLabel: '09:16 AM',
        content:
          "I'm struggling with the leader election split-vote condition in my CS301 Raft implementation. Can you explain why randomized election timeouts prevent split-vote deadlocks and give me a concrete pseudo-code example with 3 nodes?",
      },
      {
        id: 3,
        sessionId: 1,
        role: 'assistant',
        badgeLabel: 'Deep Reasoning Breakdown',
        timeLabel: '09:16 AM',
        content:
          '### 1. The Core Problem: Split-Vote Livelock\nIn a 3-node cluster (**Node A, Node B, Node C**), if all nodes use the exact same static election timeout (e.g., exactly 200ms), they will time out simultaneously when the current leader crashes. Both Node A and Node B become Candidates at term `T+1` and vote for themselves. Each sends `RequestVoteArgs` to Node C.\n\n> Node A receives 1 vote (itself), Node B receives 1 vote (itself), Node C votes for whichever arrived first. Neither candidate gathers the majority quorum of **2 votes**. Without randomization, they would repeat this simultaneously indefinitely.\n\n### 2. The Mathematical Insight: Symmetry Breaking\nRaft introduces randomized election timeouts typically sampled uniformly from `[150ms, 300ms]`. Because node timeout offsets diverge by up to 150ms (orders of magnitude larger than typical LAN RPC latency of ~1ms), one node will almost always time out first, increment its term, and collect votes before peers finish their timers.',
        codeSnippet: `func (rf *Raft) resetElectionTimer() {
    // 1. Generate randomized duration between 150ms and 300ms
    randTimeout := 150 + rand.Intn(150)
    timeoutDuration := time.Duration(randTimeout) * time.Millisecond

    if rf.electionTimer != nil {
        rf.electionTimer.Stop()
    }

    // 2. Reset timer to fire election transition on expiry
    rf.electionTimer = time.AfterFunc(timeoutDuration, func() {
        rf.mu.Lock()
        defer rf.mu.Unlock()
        if rf.state != Leader {
            rf.startElection() // Transitions to Candidate & requests votes
        }
    })
}`,
        gotchaTip:
          "Common CS301 Exam & Implementation Gotcha: Never reset a node's election timer simply because it receives a RequestVote RPC! You must only reset the election timer if you actually grant the vote, or if you receive a valid heartbeat from the legitimate current Leader.",
      },
    ],
  },
  {
    id: 2,
    title: 'Diagonalization Proofs & Symmetric Matrices',
    courseScopeJson: ['MATH240'],
    deepReasoning: true,
    dateLabel: 'Mar 22',
    messages: [
      {
        id: 4,
        sessionId: 2,
        role: 'assistant',
        badgeLabel: 'Course Synthesizer',
        timeLabel: '03:10 PM',
        content:
          'Ready to review **MATH240 Section 5.3**: Orthogonal Diagonalization and Spectral Decomposition. Ask about any proof exercise!',
      },
    ],
  },
  {
    id: 3,
    title: 'Cellular ATP Yield & Spectrophotometry',
    courseScopeJson: ['BIO110'],
    deepReasoning: false,
    dateLabel: 'Mar 19',
    messages: [
      {
        id: 5,
        sessionId: 3,
        role: 'assistant',
        badgeLabel: 'Course Synthesizer',
        timeLabel: '11:20 AM',
        content:
          'Loaded **BIO110 Enzyme Kinetics Guide**. We can walk through NADH 340nm absorbance calculations or inhibitor plots whenever you are ready.',
      },
    ],
  },
];

export const INITIAL_STUDY_GOAL: StudyGoalItem = {
  targetHours: 25,
  loggedTenths: 185,
  dailyHoursJson: [3.2, 4.1, 4.0, 2.8, 1.6, 1.4, 1.4],
};

export const INITIAL_WAIVERS: WaiverRequestItem[] = [
  {
    id: 1,
    studentName: 'Marcus Vance',
    courseCode: 'CS301',
    assignmentTitle: 'CS301 Lab 3 (Consensus Protocol)',
    reason: 'Verified medical waiver request for +48hr extension.',
    requestedHours: 48,
    status: 'pending',
    receivedLabel: 'Received 2h ago',
  },
];

export const INITIAL_DISCUSSIONS: DiscussionThreadItem[] = [
  {
    id: 1,
    studentName: 'Elena Lin',
    initials: 'EL',
    courseCode: 'CS301',
    threadNumber: 'Thread #142',
    question: '"Should the follower node reset its election timer upon receiving..."',
    aiDraft:
      'Only reset the election timer if the follower grants the vote to the candidate, or if it receives a valid AppendEntries RPC from a current-term leader.',
    replyText: null,
    repliesCount: 0,
    resolved: false,
    timeAgo: '18m ago',
  },
  {
    id: 2,
    studentName: 'Devon Kim',
    initials: 'DK',
    courseCode: 'CS450',
    threadNumber: 'Thread #98',
    question: '"Clarification on Istio VirtualService weights vs subset destination rules..."',
    aiDraft:
      'VirtualService route weights must sum to 100 across subsets defined inside the corresponding DestinationRule.',
    replyText: null,
    repliesCount: 2,
    resolved: false,
    timeAgo: '1h ago',
  },
  {
    id: 3,
    studentName: 'Siddharth Patel',
    initials: 'SP',
    courseCode: 'CS301',
    threadNumber: 'Thread #140',
    question: '"Is it permitted to use Go\'s sync/atomic for the commitIndex o..."',
    aiDraft:
      'Yes, though holding rf.mu consistently across state transitions prevents subtle race conditions with applyCh.',
    replyText: null,
    repliesCount: 0,
    resolved: false,
    timeAgo: '3h ago',
  },
];

export const INITIAL_FACULTY_SCHEDULE: FacultyScheduleItem[] = [
  {
    id: 1,
    title: 'CS301: Distributed Systems Lecture',
    timeRange: '10:00 AM - 11:30 AM',
    location: 'Hall Turing 101',
    badgeText: 'In 45m',
  },
  {
    id: 2,
    title: 'Faculty Office Hours (Open Queue)',
    timeRange: '02:00 PM - 03:30 PM',
    location: 'Office 4B & Zoom',
    badgeText: '3 booked',
  },
  {
    id: 3,
    title: 'CS Curriculum Advisory Meeting',
    timeRange: '04:00 PM - 05:00 PM',
    location: 'Faculty Lounge',
    badgeText: 'Confirmed',
  },
];
