import { create } from 'zustand';
import type {
  Doctor,
  Patient,
  PatientGroup,
  Exercise,
  Prescription,
  Checkin,
  Assessment,
  Message,
  Appointment,
  NotificationItem,
  TrendDataPoint,
  ProgressDataPoint,
  CheckinStatus,
} from '@/types';
import {
  mockDoctor,
  mockPatients,
  mockGroups,
  mockExercises,
  mockPrescriptions,
  mockCheckins,
  mockAssessments,
  mockMessages,
  mockAppointments,
  mockNotifications,
  mockTrendData,
  mockProgressData,
} from '@/mock/data';

interface AppState {
  currentDoctor: Doctor;
  patients: Patient[];
  selectedPatient: Patient | null;
  groups: PatientGroup[];
  prescriptions: Prescription[];
  exercises: Exercise[];
  checkins: Checkin[];
  assessments: Assessment[];
  messages: Message[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  trendData: TrendDataPoint[];
  progressData: ProgressDataPoint[];
  loading: boolean;

  setSelectedPatient: (patient: Patient | null) => void;
  updateCheckinStatus: (checkinId: string, status: CheckinStatus, feedback?: string) => void;
  sendMessage: (patientId: string, content: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentDoctor: mockDoctor,
  patients: mockPatients,
  selectedPatient: null,
  groups: mockGroups,
  prescriptions: mockPrescriptions,
  exercises: mockExercises,
  checkins: mockCheckins,
  assessments: mockAssessments,
  messages: mockMessages,
  appointments: mockAppointments,
  notifications: mockNotifications,
  trendData: mockTrendData,
  progressData: mockProgressData,
  loading: false,

  setSelectedPatient: (patient) => set({ selectedPatient: patient }),

  updateCheckinStatus: (checkinId, status, feedback) => {
    const state = get();
    const updatedCheckins = state.checkins.map((c) =>
      c.id === checkinId
        ? {
            ...c,
            status,
            doctorFeedback: feedback,
            reviewedAt: new Date().toLocaleString('zh-CN'),
            reviewedBy: state.currentDoctor.name,
          }
        : c
    );
    set({ checkins: updatedCheckins });
  },

  sendMessage: (patientId, content) => {
    const state = get();
    const patient = state.patients.find((p) => p.id === patientId);
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      patientId,
      patientName: patient?.name || '',
      sender: 'doctor',
      senderName: state.currentDoctor.name,
      type: 'text',
      content,
      time: new Date().toLocaleString('zh-CN', { hour12: false }).slice(5, 16),
      isRead: true,
    };
    set({ messages: [...state.messages, newMessage] });
  },

  markNotificationRead: (id) => {
    const state = get();
    set({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    });
  },

  markAllNotificationsRead: () => {
    const state = get();
    set({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    });
  },

  addAppointment: (appointment) => {
    const state = get();
    const newAppointment: Appointment = {
      ...appointment,
      id: `ap-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set({ appointments: [...state.appointments, newAppointment] });
  },
}));
