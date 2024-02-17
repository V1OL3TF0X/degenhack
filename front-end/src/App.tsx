import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainView from './views/MainView/MainView';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';

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


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
