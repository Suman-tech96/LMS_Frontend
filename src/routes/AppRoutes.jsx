import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { TeacherLayout } from '../layouts/TeacherLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { WhyUsPage } from '../pages/public/WhyUsPage';
import { ContactPage } from '../pages/public/ContactPage';
import { StudentLoginPage } from '../pages/public/StudentLoginPage';
import { TeacherLoginPage } from '../pages/public/TeacherLoginPage';
import { AdminLoginPage } from '../pages/public/AdminLoginPage';
import { StudentRegisterPage } from '../pages/public/StudentRegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/public/ResetPasswordPage';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudyMaterialsPage } from '../pages/student/StudyMaterialsPage';
import { EnrolledCoursePage } from '../pages/student/EnrolledCoursePage';
import { ExaminationSchedulePage } from '../pages/student/ExaminationSchedulePage';
import { ExaminationInstructionsPage } from '../pages/student/ExaminationInstructionsPage';
import { ExaminationAttemptPage } from '../pages/student/ExaminationAttemptPage';
import { ExamHistoryPage } from '../pages/student/ExamHistoryPage';
import { StudentResultsPage } from '../pages/student/StudentResultsPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

// Teacher & Admin Pages
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage';
import { TeacherCoursesPage } from '../pages/teacher/TeacherCoursesPage';
import { TeacherStudentsPage } from '../pages/teacher/TeacherStudentsPage';
import { TeacherMaterialsPage } from '../pages/teacher/TeacherMaterialsPage';
import { TeacherExaminationsPage } from '../pages/teacher/TeacherExaminationsPage';
import { TeacherQuestionsPage } from '../pages/teacher/TeacherQuestionsPage';
import { TeacherResultsPage } from '../pages/teacher/TeacherResultsPage';
import { TeacherProfilePage } from '../pages/teacher/TeacherProfilePage';

// Full New-Tab Preview Pages
import { StudentPreviewPage } from '../pages/preview/StudentPreviewPage';
import { CoursePreviewPage } from '../pages/preview/CoursePreviewPage';
import { ExamPreviewPage } from '../pages/preview/ExamPreviewPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/why-us" element={<WhyUsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login/student" element={<StudentLoginPage />} />
        <Route path="/login/teacher" element={<TeacherLoginPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="materials" element={<StudyMaterialsPage />} />
        <Route path="courses" element={<EnrolledCoursePage />} />
        <Route path="examinations" element={<ExaminationSchedulePage />} />
        <Route path="examinations/:id/instructions" element={<ExaminationInstructionsPage />} />
        <Route path="examinations/:id/attempt" element={<ExaminationAttemptPage />} />
        <Route path="exam-history" element={<ExamHistoryPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Faculty & Admin Portal */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboardPage />} />
        <Route path="courses" element={<TeacherCoursesPage />} />
        <Route path="students" element={<TeacherStudentsPage />} />
        <Route path="materials" element={<TeacherMaterialsPage />} />
        <Route path="examinations" element={<TeacherExaminationsPage />} />
        <Route path="examinations/:id/questions" element={<TeacherQuestionsPage />} />
        <Route path="results" element={<TeacherResultsPage />} />
        <Route path="profile" element={<TeacherProfilePage />} />
      </Route>

      {/* Standalone Full-Screen Preview Routes (Rendered in New Tab) */}
      <Route path="/teacher/students/:id/preview" element={<StudentPreviewPage />} />
      <Route path="/admin/students/:id/preview" element={<StudentPreviewPage />} />
      <Route path="/teacher/courses/:id/preview" element={<CoursePreviewPage />} />
      <Route path="/admin/courses/:id/preview" element={<CoursePreviewPage />} />
      <Route path="/teacher/examinations/:id/preview" element={<ExamPreviewPage />} />
      <Route path="/admin/examinations/:id/preview" element={<ExamPreviewPage />} />

      {/* Admin Route Aliases */}
      <Route path="/admin" element={<Navigate to="/teacher/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
      <Route path="/admin/courses" element={<Navigate to="/teacher/courses" replace />} />
      <Route path="/admin/students" element={<Navigate to="/teacher/students" replace />} />
      <Route path="/admin/materials" element={<Navigate to="/teacher/materials" replace />} />
      <Route path="/admin/examinations" element={<Navigate to="/teacher/examinations" replace />} />
      <Route path="/admin/results" element={<Navigate to="/teacher/results" replace />} />
      <Route path="/admin/profile" element={<Navigate to="/teacher/profile" replace />} />
      <Route path="/admin/*" element={<Navigate to="/teacher/dashboard" replace />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
