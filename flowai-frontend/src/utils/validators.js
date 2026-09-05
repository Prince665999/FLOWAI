export const required=(value)=>String(value||"").trim().length>0;
export const validEmail=(value)=>/^\S+@\S+\.\S+$/.test(value||"");
export const positiveInteger=(value)=>Number.isInteger(Number(value))&&Number(value)>0;
