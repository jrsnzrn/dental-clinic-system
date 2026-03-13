import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function GoogleSignInButton({ onDone }) {
  async function signIn() {
    try {
      await signInWithPopup(auth, googleProvider);
      onDone?.();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  }

  return (
    <button className="btn" type="button" onClick={signIn}>
      Continue with Google
    </button>
  );
}