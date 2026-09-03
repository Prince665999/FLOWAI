import { useEffect, useState } from "react";

import { getWorkflow, getWorkflowRun } from "../api/workflows";

export function useWorkflow(token, workflowId, runId = null) {
	const [workflow, setWorkflow] = useState(null);
	const [run, setRun] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let active = true;
		const load = async () => {
			if (!token || !workflowId) return;
			try {
				const data = await getWorkflow(token, workflowId);
				if (active) {
					setWorkflow(data);
					if (runId) setRun(await getWorkflowRun(token, workflowId, runId));
				}
			} catch (err) {
				if (active) setError(err.message || "Unable to load workflow");
			} finally {
				if (active) setLoading(false);
			}
		};
		load();
		const polling = setInterval(async () => {
			if (!active || runId) return;
			try {
				const latest = await getWorkflow(token, workflowId);
				const latestStatus = latest.runs?.[0]?.status;
				if (active) setWorkflow(latest);
				if (!["queued", "running"].includes(latestStatus)) clearInterval(polling);
			} catch {
				clearInterval(polling);
			}
		}, 3000);
		return () => { active = false; };
	}, [token, workflowId, runId]);

	return { workflow, run, loading, error, setRun };
}
