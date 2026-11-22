/*
Pseudocode:
Objective: render the Sign In route forwarding to the InstaMall Auth Portal with initialMode="signin".
Input: none.
Process: render AuthPortal with initialMode="signin".
Output: the sign in page.
*/
import AuthPortal from "../auth/page";

const SignInPage = () => {
  return <AuthPortal initialMode="signin" />;
};

export default SignInPage;
