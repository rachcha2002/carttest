import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../features/auth/authSlice";
import { AppDispatch, RootState } from "../store/store";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If we have a token in localStorage but no user data, fetch the user data
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  return <>{children}</>;
};

export default AuthProvider;
