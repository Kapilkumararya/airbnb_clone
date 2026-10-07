import AuthGuard from '@/components/AuthGuard';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
