import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { RootProvider } from "./contexts/RootProvider";
import { Toaster } from "react-hot-toast";
import Routes from "./Routes";

const App: React.FC = () => {
  return (
    <Router>
      <RootProvider>
        <Toaster position="top-right" />
        <Routes />
      </RootProvider>
    </Router>
  );
};

export default App;
