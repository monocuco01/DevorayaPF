import axios from "axios";

const api = axios.create({
  baseURL: "https://devorayaback.onrender.com", 
});

export default api;
