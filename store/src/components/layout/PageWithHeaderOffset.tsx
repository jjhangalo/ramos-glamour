export default function PageWithHeaderOffset({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 'var(--header-height, 80px)' }}>
      {children}
    </div>
  );
}
