import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainView from './views/MainView/MainView';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainView />}>
      <Route path="games" element={<MainView />} />
    </Route>
  )
);

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
