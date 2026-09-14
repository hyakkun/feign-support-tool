import React from "react";
import { createRoot } from "react-dom/client";
import { FeignSupportToolRoot } from "./FeignSupportToolRoot";
import "../styles/index.scss";

export const mountFeignSupportTool = (element) => {
  const root = createRoot(element);
  root.render(<FeignSupportToolRoot />);
  return root;
};

const rootElement = document.getElementById("root");
if (rootElement) mountFeignSupportTool(rootElement);
