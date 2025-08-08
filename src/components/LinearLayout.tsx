
import { WelcomeScreen } from "./WelcomeScreen";
import { useAuth } from "./AuthContext";

export const LinearLayout = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <WelcomeScreen 
        user={user} 
        onLogout={signOut}
      />
    </div>
  );
};
