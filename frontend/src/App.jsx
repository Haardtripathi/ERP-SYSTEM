

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/Dashboard";
import AddIncomingData from "./components/section1/incoming/AddIncomingData";
import EditIncomingData from "./components/section1/incoming/EditIncomingData";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthOnlyRoute from "./components/auth/AuthOnlyRoute";
import Sidenav from "./components/Sidenav";
import useAuthStore from "./store/authStore";
import { Toaster } from "react-hot-toast";
import IncomingPage from "./components/section1/incoming/IncomingPage";
import LeadPage from "./components/section1/lead/LeadPage";
import AddLeadData from "./components/section1/lead/AddLeadData";
import EditLeadData from "./components/section1/lead/EditLeadData";
import WorkbookPage from "./components/section1/workbook/WorkbookPage";
import PendingPage from "./components/section2/pending/PendingPage";
import EditPendingData from "./components/section2/pending/EditPendingData";
import ConfirmedPage from "./components/section2/confirmed/ConfirmedPage";
import SheetGenerator from "./components/section3/sheetGenerator/SheetGenerator";
import LabelGenerator from "./components/section3/labelGenerator/LabelGenerator";


const App = () => {
  const { checkAuth, loading, user } = useAuthStore();
  const [isSidenavCollapsed, setIsSidenavCollapsed] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="flex flex-col h-screen">

        {!loading && <Navbar />}
        <div className="flex flex-1 overflow-hidden">
          {user && <Sidenav isCollapsed={isSidenavCollapsed} setIsCollapsed={setIsSidenavCollapsed} />}
          <div
            className={`flex-1 ${user
              ? isSidenavCollapsed
                ? "ml-16"
                : "ml-64 lg:ml-56 md:ml-48 sm:ml-40 xs:ml-32"
              : ""
              } bg-gray-50 overflow-y-auto pt-16 transition-all duration-300`}
          >
            {!loading && (
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/login"
                  element={
                    <AuthOnlyRoute>
                      <Login />
                    </AuthOnlyRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <AuthOnlyRoute>
                      <Signup />
                    </AuthOnlyRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incoming"
                  element={
                    <ProtectedRoute>
                      <IncomingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-incoming-data"
                  element={
                    <ProtectedRoute>
                      <AddIncomingData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-incoming-data/:id"
                  element={
                    <ProtectedRoute>
                      <EditIncomingData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lead"
                  element={
                    <ProtectedRoute>
                      <LeadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-lead-data"
                  element={
                    <ProtectedRoute>
                      <AddLeadData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-lead-data/:id"
                  element={
                    <ProtectedRoute>
                      <EditLeadData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workbook"
                  element={
                    <ProtectedRoute>
                      <WorkbookPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pending"
                  element={
                    <ProtectedRoute>
                      <PendingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-pending-data/:id"
                  element={
                    <ProtectedRoute>
                      <EditPendingData />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/confirmed"
                  element={
                    <ProtectedRoute>
                      <ConfirmedPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sheet-generator"
                  element={
                    <ProtectedRoute>
                      <SheetGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/labels-generator"
                  element={
                    <ProtectedRoute>
                      <LabelGenerator />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </Router>
  );
};

export default App;

