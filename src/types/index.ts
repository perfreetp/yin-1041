export interface Doctor {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  authCode: string;
  isActive: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type PatientStage = '早期' | '中期' | '后期' | '维持期';
export type PatientStatus = 'active' | 'paused' | 'discharged';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: '男' | '女';
  avatar?: string;
  phone: string;
  diagnosis: string;
  surgeryDate?: string;
  riskLevel: RiskLevel;
  groupId: string;
  stage: PatientStage;
  joinDate: string;
  status: PatientStatus;
  checkinStreak: number;
  lastCheckinDate?: string;
  medicalHistory: string[];
  familyMembers: FamilyMember[];
}

export interface PatientGroup {
  id: string;
  name: string;
  description: string;
  patientCount: number;
  color: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetArea: string;
  difficulty: Difficulty;
  defaultSets: number;
  defaultReps: number;
  duration?: string;
  videoThumbnail?: string;
  tips: string[];
}

export interface PrescriptionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  order: number;
}

export interface PainSurveyConfig {
  enabled: boolean;
  type: 'NRS' | 'VAS';
  frequency: 'daily' | 'every_checkin' | 'weekly';
}

export type PrescriptionStatus = 'active' | 'completed' | 'paused';

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  name: string;
  exercises: PrescriptionExercise[];
  startDate: string;
  endDate: string;
  frequency: string;
  painSurveyConfig?: PainSurveyConfig;
  createdAt: string;
  doctorName: string;
  status: PrescriptionStatus;
}

export type CheckinStatus = 'pending' | 'approved' | 'rejected';

export interface ExerciseCompletion {
  exerciseId: string;
  exerciseName: string;
  completed: boolean;
  quality?: number;
  notes?: string;
}

export interface Checkin {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  videoUrl?: string;
  videoThumbnail?: string;
  exercisesCompleted: ExerciseCompletion[];
  painLevel?: number;
  abnormalFeedback?: string;
  status: CheckinStatus;
  doctorFeedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type AssessmentType = 'fugl_meyer' | 'berg' | 'barthel' | 'rom' | 'stage_summary';

export interface RomRecord {
  joint: string;
  side: '左' | '右' | '双侧';
  activeRange: number;
  passiveRange: number;
  normalRange: string;
  unit: string;
}

export interface Assessment {
  id: string;
  patientId: string;
  patientName: string;
  type: AssessmentType;
  typeName: string;
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  maxScore: number;
  romData?: RomRecord[];
  summary: string;
  doctorName: string;
}

export type MessageSender = 'doctor' | 'patient';
export type MessageType = 'text' | 'image' | 'system';

export interface Message {
  id: string;
  patientId: string;
  patientName: string;
  sender: MessageSender;
  senderName: string;
  type: MessageType;
  content: string;
  time: string;
  isRead: boolean;
}

export type AppointmentType = '复诊' | '评估' | '咨询';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'checkin' | 'assessment' | 'appointment' | 'message' | 'abnormal';
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  relatedId?: string;
}

export interface TrendDataPoint {
  date: string;
  checkins: number;
  assessments: number;
  avgPain: number;
}

export interface ProgressDataPoint {
  date: string;
  score: number;
  category: string;
}
