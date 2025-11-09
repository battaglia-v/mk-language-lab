// Signin page layout - bypasses admin auth requirement
// This allows the signin page to be accessible without authentication
export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
