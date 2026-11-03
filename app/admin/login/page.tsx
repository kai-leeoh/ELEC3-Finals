import LoginForm from "../../../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="page">
      <div style={{ paddingTop: 24 }}>
        <h1>Staff sign in</h1>
        <p className="sub">Use the account the owner set up for you.</p>
        <div className="card">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
