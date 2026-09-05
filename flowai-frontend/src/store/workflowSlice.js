import { createSlice } from "@reduxjs/toolkit";export default createSlice({name:"workflows",initialState:{items:[]},reducers:{setWorkflows:(s,a)=>{s.items=a.payload}}}).reducer;
