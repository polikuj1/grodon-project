// Firebase 配置文件
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 您的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyCLjp9jtiZxPI6DRdCHePVez8Poad3_GQ8",
  authDomain: "nodejs-4951c.firebaseapp.com",
  projectId: "nodejs-4951c",
  storageBucket: "nodejs-4951c.firebasestorage.app",
  messagingSenderId: "626204402058",
  appId: "1:626204402058:web:62d130ac886cf281842873",
  measurementId: "G-R602VS0506",
  databaseURL:
    "https://nodejs-4951c-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 獲取資料庫實例
const database = getDatabase(app);

export { app, database };
