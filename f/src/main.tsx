import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { RootLayout } from "./pages/RootLayout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Settings } from "./pages/Settings";
import { AdminOrganizerApplications } from "./pages/admin/AdminOrganizerApplications";
import { MyOrganizations } from "./pages/organizer/MyOrganizations";
import { EventDetail } from "./pages/EventDetail";
import { MyEvents } from "./pages/organizer/MyEvents";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "settings", element: <Settings /> },
      { path: "events/:id", element: <EventDetail /> },
      { path: "admin/organizer-applications", element: <AdminOrganizerApplications /> },
      { path: "organizer/organizations", element: <MyOrganizations /> },
      { path: "organizer/events", element: <MyEvents /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

