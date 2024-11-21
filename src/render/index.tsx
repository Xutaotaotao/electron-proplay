import * as React from "react";
import { createRoot } from 'react-dom/client';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import Main from "./pages/main";
import Work from "./pages/work";
import TestWindow from "./pages/testWindow";
import PreWindow from "./pages/preWindow";
import App from "./app";


const container = document.getElementById('root');
const root = createRoot(container!);
const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "main",
        element: <Main />,
      },
      {
        path: "work",
        element: <Work />,
      },
      {
        path: "testWindow",
        element: <TestWindow />,
      },
      {
        path: "preWindow/:id",
        element: <PreWindow />,
      },
    ],
  },
]);

root.render(<RouterProvider router={router} />);