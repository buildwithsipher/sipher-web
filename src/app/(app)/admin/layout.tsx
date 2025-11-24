export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin access is controlled by secret prompt in the page component
  // No authentication required at layout level
  return <>{children}</>
}
