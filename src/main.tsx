import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css';
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClient } from '@supabase/supabase-js';
import { Toaster } from "@/components/ui/toaster";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error from './error.tsx';
import Landing from './Landing.tsx';
import { loader as rootLoader } from "./App.tsx";
import  { loader as contactLoader } from "./App.tsx"

const supabase = createClient("https://ilfitxqmjmmbyztfgujy.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZml0eHFtam1tYnl6dGZndWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYwNTkyNzUsImV4cCI6MjAyMTYzNTI3NX0.p-6Us-Y9F1zEn7vO1RTtuEalHTm5rCkSU3rDxPeAWpc");
const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <Error/>,
    loader: rootLoader,
  },
  {
    path: "/:bentoId",
    element: <App/>,
    loader: contactLoader
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <RouterProvider router={router} />
      <Toaster />
    </SessionContextProvider>
  </React.StrictMode>,
)
