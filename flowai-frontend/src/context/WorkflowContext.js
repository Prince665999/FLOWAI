import { createContext, useContext, useState } from "react";

const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
	const [activeRun, setActiveRun] = useState(null);
	return <WorkflowContext.Provider value={{ activeRun, setActiveRun }}>{children}</WorkflowContext.Provider>;
}

export function useWorkflowContext() {
	return useContext(WorkflowContext);
}
