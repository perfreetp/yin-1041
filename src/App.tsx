import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Prescriptions from "@/pages/Prescriptions";
import Checkins from "@/pages/Checkins";
import Assessments from "@/pages/Assessments";
import Communication from "@/pages/Communication";
import Statistics from "@/pages/Statistics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<Patients />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="checkins" element={<Checkins />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="communication" element={<Communication />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
