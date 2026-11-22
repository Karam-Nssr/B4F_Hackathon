/*
Pseudocode:
Objective: render the Sign Up route forwarding to the InstaMall Auth Portal with initialMode="signup".
Input: none.
Process: render AuthPortal with initialMode="signup".
Output: the sign up page.
*/
import AuthPortal from "../auth/page";

const SignUpPage = () => {
  return <AuthPortal initialMode="signup" />;
};

export default SignUpPage;
