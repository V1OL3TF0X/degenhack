import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UseInkathonProvider, alephzeroTestnet } from '@scio-labs/use-inkathon';
import MainView from './views/MainView/MainView';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { getDeployments } from './web3/getDeployments';
import { Toaster } from 'react-hot-toast';
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
    <UseInkathonProvider appName='My dApp' defaultChain={alephzeroTestnet} deployments={getDeployments()}>
      <ThemeProvider theme={darkTheme}>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </UseInkathonProvider>
  );
}

export default App;
