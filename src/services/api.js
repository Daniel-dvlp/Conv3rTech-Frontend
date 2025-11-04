// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-conv3rtech.onrender.com/api/", // Backend desplegado en render
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;