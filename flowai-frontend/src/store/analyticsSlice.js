import { createSlice } from "@reduxjs/toolkit";export default createSlice({name:"analytics",initialState:{overview:null},reducers:{setOverview:(s,a)=>{s.overview=a.payload}}}).reducer;
