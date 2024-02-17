import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainView from './views/MainView/MainView';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainView />,
    children: [
      {
        path: 'games',
        element: <MainView />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
