import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: "#4338E8",
          colorText: "#17163B",
          colorBorder: "#DDD9EF",
          borderRadius: 10,
          fontFamily: "'Instrument Sans', system-ui, sans-serif"
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
