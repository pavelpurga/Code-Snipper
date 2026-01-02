import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Provider} from "react-redux";
import {store} from "@/app/providers/store";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "@/app/providers/query-client";
import {RouterProvider} from "react-router-dom";
import {router} from "@/app/providers/router";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
          </QueryClientProvider>
      </Provider>
  </StrictMode>,
)
