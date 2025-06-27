export type Client = {
    ClientID: string;
    ClientName: string;
    PriorityLevel: number;
    RequestedTaskIDs: string;
    GroupTag: string;
    AttributesJSON: string;
  };
  
  export type Worker = {
    WorkerID: string;
    WorkerName: string;
    Skills: string;
    AvailableSlots: string;
    MaxLoadPerPhase: number;
    WorkerGroup: string;
    QualificationLevel: string;
  };
  
  export type Task = {
    TaskID: string;
    TaskName: string;
    Category: string;
    Duration: number;
    RequiredSkills: string;
    PreferredPhases: string;
    MaxConcurrent: number;
  };
  