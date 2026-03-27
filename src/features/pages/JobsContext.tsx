import { createContext, useContext, useState, ReactNode } from "react";

export type JobStatus = "available" | "in-progress" | "completed";
export type ParcelStatus = "picked-up" | "out-for-delivery" | "delivered" | null;

export interface Job {
  id: string;
  jobNumber: string;
  pickup: string;
  dropoff: string;
  distance: string;
  earnings: string;
  status: JobStatus;
  parcelStatus?: ParcelStatus;
  customerName: string;
  packageSize: "Small" | "Medium" | "Large";
  timeLimit?: string;
  customerPhone?: string;
  packageDescription?: string;
  specialInstructions?: string;
}

const initialJobs: Job[] = [
  {
    id: "1",
    jobNumber: "JOB-2026-5647",
    pickup: "BGC, Taguig City",
    dropoff: "Makati Avenue, Makati",
    distance: "3.2 km",
    earnings: "₱85",
    status: "available",
    customerName: "Maria Santos",
    packageSize: "Small",
    timeLimit: "30 mins",
    customerPhone: "+63 912 345 6789",
    packageDescription: "Documents and papers",
    specialInstructions: "Please handle with care. Ring doorbell twice.",
  },
  {
    id: "2",
    jobNumber: "JOB-2026-5648",
    pickup: "SM Megamall, Mandaluyong",
    dropoff: "Ortigas Center, Pasig",
    distance: "2.8 km",
    earnings: "₱120",
    status: "in-progress",
    customerName: "Juan Reyes",
    packageSize: "Medium",
    timeLimit: "25 mins",
    customerPhone: "+63 917 234 5678",
    packageDescription: "Electronics - Laptop",
    specialInstructions: "Fragile item. Call upon arrival.",
  },
  {
    id: "3",
    jobNumber: "JOB-2026-5645",
    pickup: "Quezon City Hall",
    dropoff: "UP Diliman, QC",
    distance: "4.5 km",
    earnings: "₱95",
    status: "completed",
    customerName: "Anna Cruz",
    packageSize: "Small",
    customerPhone: "+63 915 876 5432",
    packageDescription: "Books and stationery",
    specialInstructions: "Leave at security desk if not home.",
  },
];

interface JobsContextType {
  jobs: Job[];
  updateJobStatus: (jobId: string, newStatus: JobStatus) => void;
  updateParcelStatus: (jobId: string, parcelStatus: ParcelStatus) => void;
}

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);

  const updateJobStatus = (jobId: string, newStatus: JobStatus) => {
    setJobs(prev =>
      prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job)
    );
  };

  const updateParcelStatus = (jobId: string, parcelStatus: ParcelStatus) => {
    setJobs(prev =>
      prev.map(job => job.id === jobId ? { ...job, parcelStatus } : job)
    );
  };

  return (
    <JobsContext.Provider value={{ jobs, updateJobStatus, updateParcelStatus }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) throw new Error("useJobs must be used within a JobsProvider");
  return context;
}