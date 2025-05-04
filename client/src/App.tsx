import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import WelcomePage from "@/components/welcome-page";
import VideosPage from "@/pages/videos-page";
import ProfilePage from "@/pages/profile-page";
import UploadPage from "@/pages/upload-page";
import MyUploadsPage from "@/pages/my-uploads-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/videos" component={VideosPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/upload" component={UploadPage} />
      <ProtectedRoute path="/my-uploads" component={MyUploadsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
