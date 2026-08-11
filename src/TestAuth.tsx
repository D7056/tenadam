import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useState } from "react";
function TestAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Registered:", user.user.email);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={register}>Register</button>
    </div>
  );
}
export default TestAuth;
