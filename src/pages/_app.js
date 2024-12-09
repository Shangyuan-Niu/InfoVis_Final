// pages/_app.js

// 引入 Bootstrap 的 CSS 文件
import 'bootstrap/dist/css/bootstrap.min.css';

// 引入你现有的全局样式文件
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
