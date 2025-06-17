// // src/utils/axiosInstance.js
// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "https://tumbledrybe.sharda.co.in/api", // Add /api here!
// });

// // Attach token for every request
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default axiosInstance;




import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://tumbledrybe.sharda.co.in/api",
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Only add Authorization header if not explicitly skipped
    if (!config.headers?.skipAuth) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Remove skipAuth key so it doesn't get sent
      delete config.headers.skipAuth;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

